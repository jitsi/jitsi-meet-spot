package com.spot.tv.domain.service

import com.spot.tv.domain.MeetingStatus

interface MeetingService {
    fun setMeetingStatus(meetingStatus: MeetingStatus) = Unit
}

class DefaultMeetingService : MeetingService