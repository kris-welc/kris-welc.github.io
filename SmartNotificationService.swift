//
//  SmartNotificationService.swift
//
//  Activity-aware intelligent notification system that learns from user behavior.
//  Adapts notification timing based on activity category and user's daily rhythm.
//
//  Extracted from a production iOS app. Domain-specific models (Activity, Interaction,
//  UserPreferences) are referenced but not included — the value is in the
//  scheduling algorithm, behavior learning, and engagement modulation.
//

import Foundation
import UserNotifications
import SwiftData

/// Activity-Aware Intelligent Notification System
///
/// Replaces fixed-interval notifications with behavior-based, context-aware scheduling.
///
/// ## Notification Windows:
/// - `eveningOnly`: Evening-specific activities (7 PM - 10 PM only)
/// - `morningOrEvening`: Time-sensitive activities (learns from user behavior)
/// - `throughoutDay`: Flexible activities (8 AM - 10 PM)
/// - `flexible`: Prefer morning/evening but adaptable
///
/// ## User Behavior Learning:
/// - Tracks first 3-5 interactions to determine morning/evening preference
/// - Adapts notification timing based on learned pattern
/// - Respects user's natural rhythm
///
/// ## Dependencies (not included — app-specific):
/// - `Activity`: has `.title`, `.category`, `.dailyProgress`, `.lastInteractionDate`
/// - `Interaction`: has `.createdAt`
/// - `UserPreferences`: persists engagement pattern, quiet hours, response history
///
@MainActor
class SmartNotificationService {
    static let shared = SmartNotificationService()

    private init() {
        setupNotificationCategories()
    }

    // MARK: - Notification Categories Setup

    private func setupNotificationCategories() {
        let engageAction = UNNotificationAction(
            identifier: "ENGAGE_ACTION",
            title: "Open",
            options: [.foreground]
        )

        let engageCategory = UNNotificationCategory(
            identifier: "ENGAGE",
            actions: [engageAction],
            intentIdentifiers: [],
            options: [.customDismissAction]
        )

        UNUserNotificationCenter.current().setNotificationCategories([engageCategory])
    }

    // MARK: - Authorization

    func requestAuthorization() async {
        do {
            let granted = try await UNUserNotificationCenter.current()
                .requestAuthorization(options: [.alert, .sound, .badge])
            if granted {
                print("Notification authorization granted")
            }
        } catch {
            print("Notification authorization error: \(error)")
        }
    }

    // MARK: - Cancel All Notifications

    func cancelAllNotifications() {
        UNUserNotificationCenter.current().removeAllPendingNotificationRequests()
    }

    // MARK: - Activity-Specific Notification Windows

    enum NotificationWindow {
        case eveningOnly      // Evening activities: 7 PM - 10 PM only (NEVER morning)
        case morningOnly      // Morning-only activities
        case morningOrEvening // Time-sensitive: learn from behavior
        case throughoutDay    // Flexible: 8 AM - 10 PM
        case flexible         // Prefer morning/evening but adaptable
    }

    /// Determine notification window based on activity category.
    ///
    /// Each activity is tagged with a category at creation time. The category
    /// drives which time-of-day window is appropriate. This prevents nonsensical
    /// notifications (e.g. an evening-only activity getting a 7 AM reminder).
    ///
    /// In production, the category-to-window mapping is loaded from a config
    /// file so product can tune it without code changes. The logic below shows
    /// the classification structure.
    func getNotificationWindow(for category: ActivityCategory) -> NotificationWindow {
        switch category {
        case .eveningRoutine:
            // Activities that only make sense in the evening (7 PM - 10 PM).
            // CRITICAL: never send morning notifications for this category.
            return .eveningOnly

        case .morningRoutine:
            return .morningOnly

        case .timeSensitive:
            // Activities users typically do at a consistent time of day.
            // The system learns whether the user prefers morning or evening
            // from their first 3-5 interactions.
            return .morningOrEvening

        case .anytime:
            // Activities that can be performed throughout the day (8 AM - 10 PM).
            return .throughoutDay

        case .structured:
            // Activities that benefit from a schedule but are flexible.
            // Prefer morning/evening but midday is acceptable.
            return .flexible
        }
    }

    /// Activity categories that drive notification window selection.
    /// Each activity is assigned a category when created.
    enum ActivityCategory {
        case eveningRoutine   // e.g. wind-down, bedtime activities
        case morningRoutine   // e.g. wake-up rituals
        case timeSensitive    // activities done at a consistent time of day
        case anytime          // can happen throughout the day
        case structured       // prefer morning/evening but adaptable
    }

    // MARK: - User Behavior Learning

    /// Learn user's engagement pattern from interaction history.
    ///
    /// Analyzes timestamps of recent interactions to classify the user as a
    /// "morning", "evening", or "flexible" person. Requires at least 3 data
    /// points before making a determination.
    func learnUserPattern(from interactions: [Interaction], preferences: UserPreferences) {
        guard interactions.count >= 3 else { return }

        let morningInteractions = interactions.filter { interaction in
            let hour = Calendar.current.component(.hour, from: interaction.createdAt)
            return hour >= 6 && hour < 12
        }

        let eveningInteractions = interactions.filter { interaction in
            let hour = Calendar.current.component(.hour, from: interaction.createdAt)
            return hour >= 17 && hour < 22
        }

        if morningInteractions.count > eveningInteractions.count && morningInteractions.count >= 2 {
            preferences.userEngagementPattern = "morning"
            if let firstMorning = morningInteractions.first {
                preferences.typicalInteractionHour = Calendar.current.component(.hour, from: firstMorning.createdAt)
                preferences.typicalInteractionMinute = Calendar.current.component(.minute, from: firstMorning.createdAt)
            }
        } else if eveningInteractions.count > morningInteractions.count && eveningInteractions.count >= 2 {
            preferences.userEngagementPattern = "evening"
            if let firstEvening = eveningInteractions.first {
                preferences.typicalInteractionHour = Calendar.current.component(.hour, from: firstEvening.createdAt)
                preferences.typicalInteractionMinute = Calendar.current.component(.minute, from: firstEvening.createdAt)
            }
        } else {
            preferences.userEngagementPattern = "flexible"
        }

        // Store recent interaction times (last 10) for pattern analysis
        let recentInteractions = interactions.sorted { $0.createdAt > $1.createdAt }.prefix(10)
        preferences.interactionTimesAsDates = Array(recentInteractions.map { $0.createdAt })

        preferences.updatedAt = Date()
        preferences.version += 1
    }

    // MARK: - Smart Notification Timing

    /// Determine notification hours based on window, user pattern, and engagement.
    ///
    /// This is the core scheduling algorithm. It cross-references:
    /// 1. Activity type (which window is appropriate)
    /// 2. User's learned rhythm (morning vs evening person)
    /// 3. Current progress (no reminders if complete)
    /// 4. Engagement level (fewer reminders for active users)
    func determineNotificationTimes(
        window: NotificationWindow,
        userPattern: String?,
        progress: Int,
        engagementLevel: EngagementLevel,
        activityTitle: String?
    ) -> [Int] { // Returns array of hours (0-23)

        switch window {
        case .eveningOnly:
            if progress == 0 {
                return [19, 21]
            } else if progress < 100 {
                return [20]
            } else {
                return []
            }

        case .morningOnly:
            if progress == 0 {
                return [7, 8]
            } else if progress < 100 {
                return [8]
            } else {
                return []
            }

        case .morningOrEvening:
            // Adapt to learned user pattern
            if let pattern = userPattern {
                if pattern == "morning" {
                    return progress == 0 ? [7, 8] : (progress < 100 ? [8] : [])
                } else if pattern == "evening" {
                    return progress == 0 ? [19, 20] : (progress < 100 ? [20] : [])
                }
            }

            // Unknown pattern: try both, modulate by engagement
            if progress == 0 {
                return [8, 20]
            } else if progress < 100 {
                switch engagementLevel {
                case .highlyActive:
                    return []
                case .active, .moderate:
                    return [20]
                case .inactive:
                    return [9, 20]
                }
            } else {
                return []
            }

        case .throughoutDay:
            switch engagementLevel {
            case .highlyActive:
                return progress == 0 ? [14] : []
            case .active:
                return progress == 0 ? [9, 14] : [14]
            case .moderate:
                return progress == 0 ? [9, 14, 19] : [14, 19]
            case .inactive:
                return progress == 0 ? [9, 12, 15, 19] : [12, 15, 19]
            }

        case .flexible:
            if let pattern = userPattern {
                if pattern == "morning" {
                    return progress == 0 ? [8, 14] : [14]
                } else if pattern == "evening" {
                    return progress == 0 ? [14, 20] : [20]
                }
            }
            return progress == 0 ? [9, 14, 20] : [14, 20]
        }
    }

    // MARK: - Engagement Level Detection

    enum EngagementLevel {
        case highlyActive  // Engages daily
        case active        // Most days
        case moderate      // 3-4 days per week
        case inactive      // < 3 days per week or 2+ days absent
    }

    /// Classify engagement from recent activity.
    ///
    /// Uses two signals: days since last app launch (recency) and
    /// count of interactions in the trailing 7-day window (frequency).
    func getEngagementLevel(activity: Activity?, preferences: UserPreferences) -> EngagementLevel {
        guard activity != nil else { return .moderate }

        let daysSinceLaunch = preferences.daysSinceLastLaunch
        if daysSinceLaunch >= 2 {
            return .inactive
        }

        let sevenDaysAgo = Calendar.current.date(byAdding: .day, value: -7, to: Date()) ?? Date()
        let recentInteractions = preferences.interactionTimesAsDates.filter { $0 >= sevenDaysAgo }

        if recentInteractions.count >= 6 {
            return .highlyActive
        } else if recentInteractions.count >= 4 {
            return .active
        } else if recentInteractions.count >= 2 {
            return .moderate
        } else {
            return .inactive
        }
    }

    // MARK: - Notification Response Learning

    /// Track that user opened the app within 1 hour of a notification at this time.
    func trackNotificationResponse(hour: Int, minute: Int, preferences: UserPreferences) {
        let key = "\(hour)_\(minute)"
        let currentCount = preferences.notificationResponseHistory[key] ?? 0
        preferences.notificationResponseHistory[key] = currentCount + 1
        preferences.updatedAt = Date()
        preferences.version += 1
    }

    /// Return notification times with 3+ tracked responses (proven effective).
    func getEffectiveNotificationTimes(preferences: UserPreferences) -> [String] {
        return preferences.notificationResponseHistory
            .filter { $0.value >= 3 }
            .map { $0.key }
            .sorted()
    }

    // MARK: - Validation Gate

    /// Multi-layered validation: checks activity window, quiet hours, recency,
    /// and ignored-time list before allowing a notification to be scheduled.
    func shouldSendNotification(
        activity: Activity?,
        hour: Int,
        preferences: UserPreferences
    ) -> Bool {
        guard preferences.notificationsEnabled else { return false }

        // Already complete — no reminder needed
        if let activity = activity, activity.dailyProgress >= 100 {
            return false
        }

        // Activity-specific time-of-day validation
        if let activity = activity {
            let window = getNotificationWindow(for: activity.category)

            switch window {
            case .eveningOnly:
                if hour < 19 || hour > 22 { return false }
            case .morningOrEvening:
                let isMorning = hour >= 6 && hour < 9
                let isEvening = hour >= 18 && hour < 21
                if !isMorning && !isEvening {
                    if let pattern = preferences.userEngagementPattern {
                        if pattern == "morning" && !isMorning { return false }
                        if pattern == "evening" && !isEvening { return false }
                    }
                    if hour >= 12 && hour < 17 { return false }
                }
            default:
                break
            }
        }

        // Don't remind if user engaged within the last hour
        if let activity = activity,
           let lastInteraction = activity.lastInteractionDate,
           Date().timeIntervalSince(lastInteraction) < 3600 {
            return false
        }

        // Quiet hours
        if preferences.quietHoursEnabled {
            if hour >= preferences.quietHoursStart || hour < preferences.quietHoursEnd {
                return false
            }
        }

        // Ignored times (user consistently doesn't respond)
        if preferences.ignoredNotificationTimes.contains("\(hour)_0") {
            return false
        }

        // General bounds: 6 AM – 10 PM
        if hour < 6 || hour > 22 { return false }

        return true
    }

    // MARK: - Smart Scheduling (Orchestrator)

    /// Top-level entry point: computes window, pattern, engagement, timing,
    /// validates each hour, then schedules the surviving set.
    func scheduleSmartNotifications(
        activity: Activity?,
        preferences: UserPreferences,
        context: ModelContext
    ) async {
        guard preferences.notificationsEnabled else {
            cancelAllNotifications()
            return
        }

        guard let activity = activity else {
            await scheduleReEngagementNotifications(preferences: preferences)
            return
        }

        let window = getNotificationWindow(for: activity.category)
        let userPattern = preferences.userEngagementPattern
        let progress = activity.dailyProgress
        let engagementLevel = getEngagementLevel(activity: activity, preferences: preferences)

        let candidateHours = determineNotificationTimes(
            window: window,
            userPattern: userPattern,
            progress: progress,
            engagementLevel: engagementLevel,
            activityTitle: activity.title
        )

        let validHours = candidateHours.filter { hour in
            shouldSendNotification(activity: activity, hour: hour, preferences: preferences)
        }

        await scheduleNotifications(hours: validHours, activity: activity, preferences: preferences)
    }

    // MARK: - Re-Engagement Notifications

    /// Schedule gentle re-engagement notifications when user has no active activity.
    private func scheduleReEngagementNotifications(preferences: UserPreferences) async {
        let center = UNUserNotificationCenter.current()

        // Clear existing re-engagement notifications
        let requests = await center.pendingNotificationRequests()
        let ids = requests
            .filter { $0.identifier.hasPrefix("smartInteraction") || $0.identifier.hasPrefix("reEngage") }
            .map { $0.identifier }
        if !ids.isEmpty {
            center.removePendingNotificationRequests(withIdentifiers: ids)
            try? await Task.sleep(for: .milliseconds(100))
        }

        // Determine best hour based on learned pattern; default to evening
        let hour: Int
        if let pattern = preferences.userEngagementPattern {
            hour = (pattern == "morning") ? 8 : 20
        } else {
            hour = 20
        }

        var dateComponents = DateComponents()
        dateComponents.hour = hour
        dateComponents.minute = 0

        let content = UNMutableNotificationContent()
        content.title = "Ready to start?"
        content.body = Self.timeGreeting(hour: hour) + "! Your next activity is waiting."
        content.sound = .default
        content.categoryIdentifier = "ENGAGE"
        content.userInfo = ["notificationType": "reEngage", "hour": hour]

        let trigger = UNCalendarNotificationTrigger(dateMatching: dateComponents, repeats: true)
        let request = UNNotificationRequest(identifier: "reEngage_\(hour)", content: content, trigger: trigger)

        do {
            try await center.add(request)
        } catch {
            print("Failed to schedule re-engagement notification: \(error)")
        }
    }

    // MARK: - Schedule Concrete Notifications

    private func scheduleNotifications(
        hours: [Int],
        activity: Activity?,
        preferences: UserPreferences
    ) async {
        let center = UNUserNotificationCenter.current()

        // Remove previously-scheduled smart notifications
        let existing = await center.pendingNotificationRequests()
        let ids = existing.filter { $0.identifier.hasPrefix("smartInteraction") }.map { $0.identifier }
        if !ids.isEmpty {
            center.removePendingNotificationRequests(withIdentifiers: ids)
            try? await Task.sleep(for: .milliseconds(100))
        }

        let activityTitle = activity?.title ?? "Your Activity"
        let progress = activity?.dailyProgress ?? 0

        for (index, hour) in hours.enumerated() {
            var dateComponents = DateComponents()
            dateComponents.hour = hour
            dateComponents.minute = 0

            let content = UNMutableNotificationContent()
            content.title = activityTitle
            content.body = Self.progressMessage(progress: progress, hour: hour)
            content.sound = .default
            content.categoryIdentifier = "ENGAGE"
            content.userInfo = [
                "activityTitle": activityTitle,
                "dailyProgress": progress,
                "notificationType": "smartInteraction",
                "hour": hour
            ]

            if #available(iOS 15.0, *) {
                content.threadIdentifier = "activity-reminder"
            }

            let trigger = UNCalendarNotificationTrigger(dateMatching: dateComponents, repeats: true)
            let identifier = "smartInteraction_\(hour)_\(index)"
            let request = UNNotificationRequest(identifier: identifier, content: content, trigger: trigger)

            do {
                try await center.add(request)
            } catch {
                print("Failed to schedule notification \(identifier): \(error)")
            }
        }
    }

    // MARK: - Helpers

    private static func timeGreeting(hour: Int) -> String {
        if hour >= 6 && hour < 12 { return "Good morning" }
        if hour >= 12 && hour < 17 { return "Good afternoon" }
        return "Good evening"
    }

    private static func progressMessage(progress: Int, hour: Int) -> String {
        let greeting = timeGreeting(hour: hour)
        switch progress {
        case 0:       return "\(greeting)! Ready to get started today?"
        case 1..<25:  return "You're at \(progress)%. Keep the momentum going!"
        case 25..<50: return "Nice progress at \(progress)%! Ready to continue?"
        case 50..<75: return "You're at \(progress)%! Almost there."
        case 75..<100: return "So close at \(progress)%! Finish strong."
        default:      return "Great work today!"
        }
    }
}
