import React, { useState, useEffect } from 'react';
import { View, Text, TouchableOpacity, ScrollView, ActivityIndicator } from 'react-native';
import { format, addDays, isSameDay, startOfWeek, isToday, isBefore } from 'date-fns';
import { th } from 'date-fns/locale';
import { availabilityService } from '@/services/availability';

interface TimeSlot {
  time: string;
  available: boolean;
}

interface TimeSlotPickerProps {
  selectedDate: Date;
  onDateSelect: (date: Date) => void;
  selectedTime: string;
  onTimeSelect: (time: string) => void;
  doctorId?: string;
  availableSlots?: TimeSlot[];
  weeksToShow?: number;
}

const generateDefaultSlots = (): TimeSlot[] => {
  const slots: TimeSlot[] = [];
  const times = [
    '09:00', '09:30', '10:00', '10:30', '11:00', '11:30',
    '14:00', '14:30', '15:00', '15:30', '16:00', '16:30'
  ];

  times.forEach(time => {
    slots.push({
      time,
      available: true // Fixed availability for demo when no doctor selected
    });
  });

  return slots;
};

export const TimeSlotPicker = ({
  selectedDate,
  onDateSelect,
  selectedTime,
  onTimeSelect,
  doctorId,
  availableSlots,
  weeksToShow = 2
}: TimeSlotPickerProps) => {
  const [currentWeekStart, setCurrentWeekStart] = useState(startOfWeek(new Date(), { weekStartsOn: 1 }));
  const [realTimeSlots, setRealTimeSlots] = useState<TimeSlot[]>([]);
  const [isLoadingSlots, setIsLoadingSlots] = useState(false);
  const [slotsError, setSlotsError] = useState<string | null>(null);

  // Generate dates for the current week
  const generateWeekDates = (weekStart: Date) => {
    const dates = [];
    for (let i = 0; i < 7; i++) {
      dates.push(addDays(weekStart, i));
    }
    return dates;
  };

  const weekDates = generateWeekDates(currentWeekStart);

  const nextWeek = () => {
    setCurrentWeekStart(addDays(currentWeekStart, 7));
  };

  const prevWeek = () => {
    const newWeekStart = addDays(currentWeekStart, -7);
    const today = startOfWeek(new Date(), { weekStartsOn: 1 });
    if (!isBefore(newWeekStart, today)) {
      setCurrentWeekStart(newWeekStart);
    }
  };

  const canGoPrev = !isSameDay(currentWeekStart, startOfWeek(new Date(), { weekStartsOn: 1 }));

  // Fetch real time slots when doctor or date changes
  useEffect(() => {
    const fetchTimeSlots = async () => {
      if (!doctorId) {
        setRealTimeSlots([]);
        setSlotsError(null);
        setIsLoadingSlots(false);
        return;
      }

      setIsLoadingSlots(true);
      setSlotsError(null);

      try {
        console.log('🔍 Fetching time slots for doctor:', doctorId, 'date:', selectedDate);
        const dateString = availabilityService.formatDateForApi(selectedDate);
        console.log('📅 Formatted date string:', dateString);

        const response = await availabilityService.getAvailableTimeSlots(doctorId, dateString);
        console.log('✅ API Response:', response);

        // Convert API response to TimeSlot format
        const slots: TimeSlot[] = response.availableSlots.map(time => ({
          time,
          available: true
        }));

        console.log('⏰ Generated slots:', slots);
        setRealTimeSlots(slots);
      } catch (error) {
        console.error('❌ Error fetching time slots:', error);
        setSlotsError('ไม่สามารถโหลดเวลาได้ กรุณาลองใหม่อีกครั้ง');
        setRealTimeSlots([]);
      } finally {
        setIsLoadingSlots(false);
      }
    };

    fetchTimeSlots();
  }, [doctorId, selectedDate]);

  // Determine which slots to show
  const displaySlots = doctorId ? realTimeSlots : (availableSlots || generateDefaultSlots());

  console.log('🔍 TimeSlotPicker Debug:', {
    doctorId,
    isLoadingSlots,
    slotsError,
    realTimeSlotsCount: realTimeSlots.length,
    displaySlotsCount: displaySlots.length,
    usingRealSlots: !!doctorId,
    selectedDate: selectedDate.toISOString().split('T')[0]
  });

  return (
    <View className="bg-white">
      {/* Date Picker */}
      <View className="px-5 py-4 border-b border-secondary-100">
        <View className="flex-row items-center justify-between mb-4">
          <Text className="text-lg font-rubik-semiBold text-text-primary">
            เลือกวันที่
          </Text>
          <View className="flex-row items-center space-x-4">
            <TouchableOpacity
              onPress={prevWeek}
              disabled={!canGoPrev}
              className={`px-2 py-1 ${canGoPrev ? '' : 'opacity-30'}`}
            >
              <Text className="text-primary-600 font-rubik-medium">‹</Text>
            </TouchableOpacity>
            <Text className="text-base font-rubik-medium text-secondary-600 min-w-32 text-center">
              {format(currentWeekStart, 'MMM yyyy', { locale: th })}
            </Text>
            <TouchableOpacity onPress={nextWeek} className="px-2 py-1">
              <Text className="text-primary-600 font-rubik-medium">›</Text>
            </TouchableOpacity>
          </View>
        </View>

        <ScrollView horizontal showsHorizontalScrollIndicator={false}>
          <View className="flex-row space-x-3">
            {weekDates.map((date) => {
              const isSelected = isSameDay(date, selectedDate);
              const isCurrentDay = isToday(date);
              const isPast = isBefore(date, new Date()) && !isCurrentDay;

              return (
                <TouchableOpacity
                  key={date.getTime()}
                  onPress={() => !isPast && onDateSelect(date)}
                  disabled={isPast}
                  className={`items-center py-3 px-4 rounded-xl min-w-16 ${
                    isSelected
                      ? 'bg-primary-600'
                      : isPast
                      ? 'bg-secondary-100'
                      : 'bg-secondary-50'
                  }`}
                >
                  <Text
                    className={`text-xs font-rubik-medium mb-1 ${
                      isSelected
                        ? 'text-white'
                        : isPast
                        ? 'text-secondary-400'
                        : 'text-secondary-600'
                    }`}
                  >
                    {format(date, 'EEE', { locale: th })}
                  </Text>
                  <Text
                    className={`text-lg font-rubik-semiBold ${
                      isSelected
                        ? 'text-white'
                        : isPast
                        ? 'text-secondary-400'
                        : isCurrentDay
                        ? 'text-primary-600'
                        : 'text-text-primary'
                    }`}
                  >
                    {format(date, 'd')}
                  </Text>
                  {isCurrentDay && !isSelected && (
                    <View className="w-1 h-1 bg-primary-600 rounded-full mt-1" />
                  )}
                </TouchableOpacity>
              );
            })}
          </View>
        </ScrollView>
      </View>

      {/* Time Picker */}
      <View className="px-5 py-4">
        <Text className="text-lg font-rubik-semiBold text-text-primary mb-4">
          เลือกเวลา
        </Text>

        {/* Loading State */}
        {isLoadingSlots && doctorId && (
          <View className="items-center py-8">
            <ActivityIndicator size="large" color="#007AFF" />
            <Text className="text-sm font-rubik text-secondary-500 mt-2">
              กำลังโหลดเวลาที่ว่าง...
            </Text>
          </View>
        )}

        {/* Error State */}
        {slotsError && (
          <View className="items-center py-8">
            <Text className="text-base font-rubik text-red-600 text-center">
              {slotsError}
            </Text>
            <TouchableOpacity
              onPress={() => {
                const fetchTimeSlots = async () => {
                  if (!doctorId) return;
                  setIsLoadingSlots(true);
                  setSlotsError(null);
                  try {
                    const dateString = availabilityService.formatDateForApi(selectedDate);
                    const response = await availabilityService.getAvailableTimeSlots(doctorId, dateString);
                    const slots: TimeSlot[] = response.availableSlots.map(time => ({
                      time,
                      available: true
                    }));
                    setRealTimeSlots(slots);
                  } catch (error) {
                    setSlotsError('ไม่สามารถโหลดเวลาได้ กรุณาลองใหม่อีกครั้ง');
                    setRealTimeSlots([]);
                  } finally {
                    setIsLoadingSlots(false);
                  }
                };
                fetchTimeSlots();
              }}
              className="mt-2 px-4 py-2 bg-primary-600 rounded-lg"
            >
              <Text className="text-white font-rubik-medium">ลองใหม่</Text>
            </TouchableOpacity>
          </View>
        )}

        {/* Time Slots */}
        {!isLoadingSlots && !slotsError && (
          <>
            <View className="flex-row flex-wrap">
              {displaySlots.map((slot) => {
                const isSelected = selectedTime === slot.time;
                const isAvailable = slot.available;

                return (
                  <TouchableOpacity
                    key={slot.time}
                    onPress={() => isAvailable && onTimeSelect(slot.time)}
                    disabled={!isAvailable}
                    className={`px-4 py-3 rounded-xl border mr-3 mb-3 min-w-20 items-center ${
                      isSelected
                        ? 'bg-primary-600 border-primary-600'
                        : isAvailable
                        ? 'bg-white border-secondary-200'
                        : 'bg-secondary-50 border-secondary-100'
                    }`}
                  >
                    <Text
                      className={`text-base font-rubik-medium ${
                        isSelected
                          ? 'text-white'
                          : isAvailable
                          ? 'text-text-primary'
                          : 'text-secondary-400'
                      }`}
                    >
                      {slot.time}
                    </Text>
                  </TouchableOpacity>
                );
              })}
            </View>

            {/* No Slots Available Message */}
            {displaySlots.filter(slot => slot.available).length === 0 && (
              <View className="items-center py-8">
                <Text className="text-base font-rubik text-secondary-600">
                  {doctorId ? 'หมอไม่มีเวลาว่างในวันนี้' : 'ไม่มีช่วงเวลาว่างในวันนี้'}
                </Text>
                <Text className="text-sm font-rubik text-secondary-500 mt-1">
                  กรุณาเลือกวันอื่น
                </Text>
              </View>
            )}
          </>
        )}
      </View>
    </View>
  );
};