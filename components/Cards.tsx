import icons from '@/constants/icons';
import images from '@/constants/images';
import { View, Text, TouchableOpacity, Image } from 'react-native';
import { Doctor, Appointment, AppointmentStatus } from '@/types/medical';

interface DoctorCardProps {
    doctor: Doctor;
    onPress?: () => void;
    variant?: 'featured' | 'list';
}

interface AppointmentCardProps {
    appointment: Appointment;
    onPress?: () => void;
    showActions?: boolean;
}

export const DoctorCard = ({ doctor, onPress, variant = 'list' }: DoctorCardProps) => {
    const doctorName = `${doctor.user.firstName} ${doctor.user.lastName}`;
    const rating = doctor.rating || 0;
    const reviewCount = doctor.totalRatings || 0;

    if (variant === 'featured') {
        return (
            <TouchableOpacity onPress={onPress} className='flex flex-col items-start w-60 h-80 relative mr-4'>
                <Image
                    source={doctor.profileImage ? { uri: doctor.profileImage } : images.avatar}
                    className='size-full rounded-2xl'
                />
                <Image source={images.cardGradient} className='size-full rounded-2xl absolute bottom-0' />

                {/* Rating Badge */}
                <View className='flex flex-row items-center bg-white/90 px-3 py-1.5 rounded-full absolute top-5 right-5'>
                    <Image source={icons.star} className='size-3.5' />
                    <Text className='text-xs font-rubik-bold text-primary-600 mt-1'>{rating.toFixed(1)}</Text>
                </View>

                {/* Specialty Badge */}
                <View className='bg-primary-600/90 px-3 py-1 rounded-full absolute top-5 left-5'>
                    <Text className='text-xs font-rubik-semiBold text-white'>{doctor.specialty.name}</Text>
                </View>

                {/* Doctor Info Overlay */}
                <View className='flex flex-col items-start absolute bottom-5 inset-x-5'>
                    <Text className='text-xl font-rubik-extraBold text-white' numberOfLines={1}>
                        {doctorName}
                    </Text>
                    <Text className='text-base font-rubik text-white/90' numberOfLines={1}>
                        {doctor.experienceYears} ปีประสบการณ์
                    </Text>

                    <View className='flex flex-row items-center justify-between w-full mt-2'>
                        <Text className='text-xl font-rubik-extraBold text-white'>
                            ฿{doctor.consultationFee}
                        </Text>
                        <View className='bg-white/20 p-2 rounded-full'>
                            <Text className='text-white text-xs'>💉</Text>
                        </View>
                    </View>
                </View>
            </TouchableOpacity>
        );
    }

    return (
        <TouchableOpacity onPress={onPress} className='flex-1 w-full my-2 px-4 py-4 rounded-xl bg-white border border-secondary-200 shadow-sm'>
            {/* Rating Badge */}
            <View className='flex flex-row items-center absolute px-2 top-4 right-4 bg-primary-50 py-1 rounded-full z-50'>
                <Image source={icons.star} className='size-3 mr-1' tintColor='#f59e0b' />
                <Text className='text-xs font-rubik-semiBold text-secondary-700'>{rating.toFixed(1)}</Text>
            </View>

            <View className='flex flex-row'>
                {/* Doctor Avatar */}
                <Image
                    source={doctor.profileImage ? { uri: doctor.profileImage } : images.avatar}
                    className='w-16 h-16 rounded-full border-2 border-primary-100'
                />

                {/* Doctor Info */}
                <View className='flex-1 ml-4'>
                    <Text className='text-lg font-rubik-bold text-text-primary' numberOfLines={1}>
                        {doctorName}
                    </Text>
                    <Text className='text-sm font-rubik text-primary-600 mt-1'>
                        {doctor.specialty.name}
                    </Text>

                    {/* Experience & Room */}
                    <View className='flex flex-row items-center mt-2'>
                        <View className='bg-secondary-100 px-2 py-1 rounded'>
                            <Text className='text-xs font-rubik-medium text-secondary-600'>
                                {doctor.experienceYears} ปี
                            </Text>
                        </View>
                        {doctor.roomNumber && (
                            <>
                                <Text className='text-secondary-400 mx-2'>•</Text>
                                <Text className='text-xs font-rubik text-secondary-600'>
                                    ห้อง {doctor.roomNumber}
                                </Text>
                            </>
                        )}
                    </View>

                    {/* Price & Reviews */}
                    <View className='flex flex-row items-center justify-between mt-3'>
                        <Text className='text-lg font-rubik-bold text-primary-600'>
                            ฿{doctor.consultationFee}
                        </Text>
                        <Text className='text-xs font-rubik text-secondary-500'>
                            {reviewCount} รีวิว
                        </Text>
                    </View>
                </View>
            </View>
        </TouchableOpacity>
    );
};

export const AppointmentCard = ({ appointment, onPress, showActions = false }: AppointmentCardProps) => {
    const doctorName = `${appointment.doctor.user.firstName} ${appointment.doctor.user.lastName}`;
    const appointmentDate = new Date(appointment.appointmentDateTime);
    const dateStr = appointmentDate.toLocaleDateString('th-TH', {
        day: 'numeric',
        month: 'short',
        year: 'numeric'
    });
    const timeStr = appointmentDate.toLocaleTimeString('th-TH', {
        hour: '2-digit',
        minute: '2-digit'
    });

    const getStatusColor = (status: AppointmentStatus) => {
        switch (status) {
            case AppointmentStatus.CONFIRMED:
                return 'bg-success-50 text-success-600 border-success-200';
            case AppointmentStatus.PENDING:
                return 'bg-warning-50 text-warning-600 border-warning-200';
            case AppointmentStatus.CANCELLED:
            case AppointmentStatus.REJECTED:
                return 'bg-error-50 text-error-600 border-error-200';
            case AppointmentStatus.COMPLETED:
                return 'bg-secondary-50 text-secondary-600 border-secondary-200';
            default:
                return 'bg-secondary-50 text-secondary-600 border-secondary-200';
        }
    };

    const getStatusText = (status: AppointmentStatus) => {
        switch (status) {
            case AppointmentStatus.CONFIRMED:
                return 'ยืนยันแล้ว';
            case AppointmentStatus.PENDING:
                return 'รอยืนยัน';
            case AppointmentStatus.CANCELLED:
                return 'ยกเลิกแล้ว';
            case AppointmentStatus.REJECTED:
                return 'ปฏิเสธ';
            case AppointmentStatus.COMPLETED:
                return 'เสร็จสิ้น';
            default:
                return status;
        }
    };

    return (
        <TouchableOpacity onPress={onPress} className='w-full my-2 p-4 rounded-xl bg-white border border-secondary-200 shadow-sm'>
            {/* Header with Status */}
            <View className='flex flex-row items-center justify-between mb-3'>
                <Text className='text-base font-rubik-semiBold text-text-primary'>
                    {dateStr} • {timeStr}
                </Text>
                <View className={`px-3 py-1 rounded-full border ${getStatusColor(appointment.status)}`}>
                    <Text className='text-xs font-rubik-semiBold'>
                        {getStatusText(appointment.status)}
                    </Text>
                </View>
            </View>

            <View className='flex flex-row'>
                {/* Doctor Avatar */}
                <Image
                    source={appointment.doctor.profileImage ? { uri: appointment.doctor.profileImage } : images.avatar}
                    className='w-12 h-12 rounded-full border border-primary-100'
                />

                {/* Appointment Info */}
                <View className='flex-1 ml-3'>
                    <Text className='text-lg font-rubik-bold text-text-primary'>
                        {doctorName}
                    </Text>
                    <Text className='text-sm font-rubik text-primary-600'>
                        {appointment.doctor.specialty.name}
                    </Text>

                    {/* Duration & Room */}
                    <View className='flex flex-row items-center mt-1'>
                        <Text className='text-xs font-rubik text-secondary-600'>
                            {appointment.durationMinutes} นาที
                        </Text>
                        {appointment.doctor.roomNumber && (
                            <>
                                <Text className='text-secondary-400 mx-2'>•</Text>
                                <Text className='text-xs font-rubik text-secondary-600'>
                                    ห้อง {appointment.doctor.roomNumber}
                                </Text>
                            </>
                        )}
                    </View>

                    {/* Notes */}
                    {appointment.notes && (
                        <Text className='text-xs font-rubik text-secondary-500 mt-2' numberOfLines={2}>
                            หมายเหตุ: {appointment.notes}
                        </Text>
                    )}
                </View>

                {/* Price */}
                <View className='items-end justify-center'>
                    <Text className='text-base font-rubik-bold text-primary-600'>
                        ฿{appointment.doctor.consultationFee}
                    </Text>
                </View>
            </View>
        </TouchableOpacity>
    );
};

// Keep legacy Cards export for backward compatibility
export const Cards = DoctorCard;