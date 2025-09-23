import { Doctor, Appointment, AppointmentStatus, Specialty } from '@/types/medical';

export const mockSpecialties: Specialty[] = [
  {
    id: '1',
    name: 'อายุรกรรม',
    description: 'โรคทั่วไป ไข้ ปวดหัว ปวดท้อง',
    createdAt: '2024-01-01T00:00:00Z'
  },
  {
    id: '2',
    name: 'โรคหัวใจ',
    description: 'โรคหัวใจและหลอดเลือด',
    createdAt: '2024-01-01T00:00:00Z'
  },
  {
    id: '3',
    name: 'กุมารเวชกรรม',
    description: 'แพทย์เด็ก อายุ 0-18 ปี',
    createdAt: '2024-01-01T00:00:00Z'
  },
  {
    id: '4',
    name: 'ศัลยกรรม',
    description: 'ผ่าตัด หัตถการต่างๆ',
    createdAt: '2024-01-01T00:00:00Z'
  },
  {
    id: '5',
    name: 'โรคผิวหนัง',
    description: 'ผิวหนัง ผมและเล็บ',
    createdAt: '2024-01-01T00:00:00Z'
  }
];

export const mockDoctors: Doctor[] = [
  {
    id: '1',
    user: {
      id: '101',
      email: 'dr.somchai@hospital.com',
      firstName: 'นพ.สมชาย',
      lastName: 'ใจดี',
      phone: '081-234-5678'
    },
    specialty: mockSpecialties[0], // อายุรกรรม
    licenseNumber: 'DOC-2024-001',
    bio: 'แพทย์ผู้เชี่ยวชาญด้านอายุรกรรม มีประสบการณ์กว่า 15 ปี ในการรักษาโรคทั่วไป',
    experienceYears: 15,
    consultationFee: 500,
    roomNumber: 'A101',
    isActive: true,
    rating: 4.8,
    totalRatings: 256,
    profileImage: undefined,
    createdAt: '2024-01-01T00:00:00Z',
    updatedAt: '2024-01-01T00:00:00Z'
  },
  {
    id: '2',
    user: {
      id: '102',
      email: 'dr.weerawat@hospital.com',
      firstName: 'นพ.วีรวัฒน์',
      lastName: 'สุขใส',
      phone: '081-234-5679'
    },
    specialty: mockSpecialties[1], // โรคหัวใจ
    licenseNumber: 'DOC-2024-002',
    bio: 'ผู้เชี่ยวชาญด้านโรคหัวใจและหลอดเลือด เชี่ยวชาญการรักษาโรคหัวใจขาดเลือด',
    experienceYears: 12,
    consultationFee: 800,
    roomNumber: 'B205',
    isActive: true,
    rating: 4.9,
    totalRatings: 189,
    profileImage: undefined,
    createdAt: '2024-01-01T00:00:00Z',
    updatedAt: '2024-01-01T00:00:00Z'
  },
  {
    id: '3',
    user: {
      id: '103',
      email: 'dr.duangjai@hospital.com',
      firstName: 'นพ.ดวงใจ',
      lastName: 'รักษาดี',
      phone: '081-234-5680'
    },
    specialty: mockSpecialties[2], // กุมารเวชกรรม
    licenseNumber: 'DOC-2024-003',
    bio: 'แพทย์เด็กผู้เชี่ยวชาญด้านการเจริญเติบโตและพัฒนาการของเด็ก',
    experienceYears: 8,
    consultationFee: 450,
    roomNumber: 'C103',
    isActive: true,
    rating: 4.7,
    totalRatings: 145,
    profileImage: undefined,
    createdAt: '2024-01-01T00:00:00Z',
    updatedAt: '2024-01-01T00:00:00Z'
  },
  {
    id: '4',
    user: {
      id: '104',
      email: 'dr.siriwat@hospital.com',
      firstName: 'นพ.ศิริวัฒน์',
      lastName: 'ผ่าไว',
      phone: '081-234-5681'
    },
    specialty: mockSpecialties[3], // ศัลยกรรม
    licenseNumber: 'DOC-2024-004',
    bio: 'ศัลยแพทย์ผู้เชี่ยวชาญด้านศัลยกรรมทั่วไป และศัลยกรรมระบบทางเดินอาหาร',
    experienceYears: 20,
    consultationFee: 1200,
    roomNumber: 'D301',
    isActive: true,
    rating: 4.9,
    totalRatings: 320,
    profileImage: undefined,
    createdAt: '2024-01-01T00:00:00Z',
    updatedAt: '2024-01-01T00:00:00Z'
  },
  {
    id: '5',
    user: {
      id: '105',
      email: 'dr.panida@hospital.com',
      firstName: 'นพ.ปนิดา',
      lastName: 'หน้าใส',
      phone: '081-234-5682'
    },
    specialty: mockSpecialties[4], // โรคผิวหนัง
    licenseNumber: 'DOC-2024-005',
    bio: 'แพทย์ผู้เชี่ยวชาญด้านโรคผิวหนัง เชี่ยวชาญการรักษาสิว โรคภูมิแพ้ผิวหนัง',
    experienceYears: 10,
    consultationFee: 600,
    roomNumber: 'E102',
    isActive: true,
    rating: 4.6,
    totalRatings: 98,
    profileImage: undefined,
    createdAt: '2024-01-01T00:00:00Z',
    updatedAt: '2024-01-01T00:00:00Z'
  }
];

export const mockAppointments: Appointment[] = [
  {
    id: 'apt-001',
    doctor: mockDoctors[0],
    patient: {
      id: 'pat-001',
      firstName: 'สมหญิง',
      lastName: 'ใจดี',
      email: 'somying@email.com',
      phone: '089-123-4567'
    },
    appointmentDateTime: '2024-09-25T09:00:00Z',
    durationMinutes: 30,
    status: AppointmentStatus.CONFIRMED,
    notes: 'ปวดท้อง มีไข้เล็กน้อย',
    createdAt: '2024-09-23T10:00:00Z',
    updatedAt: '2024-09-23T10:00:00Z'
  },
  {
    id: 'apt-002',
    doctor: mockDoctors[1],
    patient: {
      id: 'pat-001',
      firstName: 'สมหญิง',
      lastName: 'ใจดี',
      email: 'somying@email.com',
      phone: '089-123-4567'
    },
    appointmentDateTime: '2024-09-28T14:30:00Z',
    durationMinutes: 45,
    status: AppointmentStatus.PENDING,
    notes: 'เจ็บหน้าอก หายใจลำบาก',
    createdAt: '2024-09-23T11:00:00Z',
    updatedAt: '2024-09-23T11:00:00Z'
  },
  {
    id: 'apt-003',
    doctor: mockDoctors[2],
    patient: {
      id: 'pat-001',
      firstName: 'สมหญิง',
      lastName: 'ใจดี',
      email: 'somying@email.com',
      phone: '089-123-4567'
    },
    appointmentDateTime: '2024-09-20T10:00:00Z',
    durationMinutes: 30,
    status: AppointmentStatus.COMPLETED,
    notes: 'ตรวจสุขภาพลูกประจำปี',
    doctorNotes: 'เด็กมีสุขภาพแข็งแรงดี น้ำหนักเพิ่มตามเกณฑ์',
    createdAt: '2024-09-18T09:00:00Z',
    updatedAt: '2024-09-20T10:30:00Z'
  },
  {
    id: 'apt-004',
    doctor: mockDoctors[4],
    patient: {
      id: 'pat-001',
      firstName: 'สมหญิง',
      lastName: 'ใจดี',
      email: 'somying@email.com',
      phone: '089-123-4567'
    },
    appointmentDateTime: '2024-09-15T15:00:00Z',
    durationMinutes: 30,
    status: AppointmentStatus.CANCELLED,
    notes: 'ผื่นแพ้ที่ใบหน้า',
    createdAt: '2024-09-13T14:00:00Z',
    updatedAt: '2024-09-14T16:00:00Z'
  }
];

// Helper functions
export const getDoctorsBySpecialty = (specialtyId: string): Doctor[] => {
  return mockDoctors.filter(doctor => doctor.specialty.id === specialtyId);
};

export const getAppointmentsByPatient = (patientId: string): Appointment[] => {
  return mockAppointments.filter(appointment => appointment.patient.id === patientId);
};

export const getAppointmentsByDoctor = (doctorId: string): Appointment[] => {
  return mockAppointments.filter(appointment => appointment.doctor.id === doctorId);
};

export const getFeaturedDoctors = (): Doctor[] => {
  return mockDoctors
    .filter(doctor => doctor.rating && doctor.rating >= 4.5)
    .sort((a, b) => (b.rating || 0) - (a.rating || 0))
    .slice(0, 3);
};

export const getSpecialtyWithDoctorCount = () => {
  return mockSpecialties.map(specialty => ({
    ...specialty,
    doctorCount: getDoctorsBySpecialty(specialty.id).length
  }));
};