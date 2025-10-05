import { apiClient } from '../api/client';
import { Doctor, DoctorSearchFilters } from '@/types/medical';

export interface DoctorRecommendationRequest {
  specialtyId?: number;
  symptoms?: string;
  maxFee?: number;
  maxExperienceYears?: number;
  preferredGender?: 'male' | 'female';
  minRating?: number;
  preferredTimeSlot?: 'morning' | 'afternoon' | 'evening';
  urgentCase?: boolean;
}

export interface DoctorRecommendationResponse {
  doctors: Doctor[];
  totalFound: number;
  criteria: DoctorRecommendationRequest;
  message: string;
}

/**
 * แนะนำแพทย์อัตโนมัติตามอาการและความต้องการ
 */
export const recommendDoctors = async (
  request: DoctorRecommendationRequest
): Promise<DoctorRecommendationResponse> => {
  try {
    console.log('🔍 Requesting doctor recommendations:', request);

    const response = await apiClient.post<DoctorRecommendationResponse>(
      '/doctors/recommend',
      request
    );

    console.log('✅ Received doctor recommendations:', response);
    return response;
  } catch (error: any) {
    console.error('❌ Error getting doctor recommendations:', error);
    console.log('⚠️ Recommendation API not available, using fallback strategy...');

    // Fallback: Use simple recommendation based on specialty and filters
    const doctors = await getSimpleDoctorRecommendations(request.specialtyId, request.symptoms);

    return {
      doctors: doctors,
      totalFound: doctors.length,
      criteria: request,
      message: 'แนะนำแพทย์ตามความเชี่ยวชาญและคะแนนรีวิว (ระบบ AI ไม่พร้อมใช้งาน)'
    };
  }
};

/**
 * แนะนำแพทย์โดยใช้ข้อมูลเบื้องต้น (สำหรับ fallback)
 */
export const getSimpleDoctorRecommendations = async (
  specialtyId?: number,
  symptoms?: string
): Promise<Doctor[]> => {
  try {
    // ใช้ API ค้นหาหมอปกติ แต่เรียงตามคะแนนและประสบการณ์
    const filters: DoctorSearchFilters = {
      specialtyId: specialtyId?.toString(),
      sortBy: 'rating',
      sortOrder: 'desc',
      page: 0,
      size: 5 // จำกัดเฉพาะ 5 คนแรก
    };

    // เรียก API ค้นหาหมอ
    const response = await apiClient.get<{
      doctors: Doctor[];
      totalItems: number;
    }>('/doctors', {
      params: filters
    });

    console.log('✅ Fallback recommendations:', response.doctors);
    return response.doctors || [];
  } catch (error) {
    console.error('❌ Error getting fallback recommendations:', error);
    return [];
  }
};

/**
 * แนะนำแพทย์ตามอาการเฉพาะ
 */
export const recommendDoctorsBySymptoms = async (
  symptoms: string,
  maxResults: number = 3
): Promise<Doctor[]> => {
  try {
    // แมพอาการเป็น specialty ID
    const specialtyMapping = getSpecialtyFromSymptoms(symptoms);

    const request: DoctorRecommendationRequest = {
      specialtyId: specialtyMapping.specialtyId,
      symptoms: symptoms,
      maxFee: 2000, // ค่าบริการไม่เกิน 2000 บาท
      urgentCase: checkIfUrgent(symptoms)
    };

    const response = await recommendDoctors(request);
    return response.doctors.slice(0, maxResults);
  } catch (error) {
    console.error('❌ Error getting symptom-based recommendations:', error);

    // Fallback: ใช้การค้นหาแบบธรรมดา
    if (specialtyMapping?.specialtyId) {
      return await getSimpleDoctorRecommendations(specialtyMapping.specialtyId, symptoms);
    }

    return [];
  }
};

/**
 * แมพอาการเป็น specialty ID
 */
const getSpecialtyFromSymptoms = (symptoms: string): { specialtyId?: number; confidence: number } => {
  const symptomLower = symptoms.toLowerCase();

  // แมพคำสำคัญกับ specialty ID
  const symptomMap = [
    {
      keywords: ['ไข้', 'ปวดหัว', 'ปวดท้อง', 'ท้องเสีย', 'ไอ', 'เจ็บคอ', 'เหนื่อย', 'อ่อนเพลีย'],
      specialtyId: 1, // อายุรกรรม
      confidence: 0.8
    },
    {
      keywords: ['เด็ก', 'ไข้เด็ก', 'วัคซีน', 'เจริญเติบโต', 'แพ้เด็ก'],
      specialtyId: 2, // กุมารเวชกรรม
      confidence: 0.9
    },
    {
      keywords: ['บาดเจ็บ', 'แผล', 'ผ่าตัด', 'ปวดท้อง', 'นิ่ว'],
      specialtyId: 3, // ศัลยกรรม
      confidence: 0.7
    },
    {
      keywords: ['กระดูก', 'ข้อ', 'เข่า', 'ไหล่', 'หลัง', 'ปวดหลัง', 'ปวดเข่า'],
      specialtyId: 4, // ออร์โธปิดิกส์
      confidence: 0.9
    },
    {
      keywords: ['หู', 'คอ', 'จมูก', 'เจ็บคอ', 'หูอื้อ', 'เสียงแหบ', 'จาม'],
      specialtyId: 5, // หู คอ จมูก
      confidence: 0.8
    },
    {
      keywords: ['ตา', 'มอง', 'เบลอ', 'ตาแห้ง', 'ตาแดง', 'ปวดตา'],
      specialtyId: 6, // ตา
      confidence: 0.9
    },
    {
      keywords: ['ผู้หญิง', 'ตั้งครรภ์', 'คลอด', 'ประจำเดือน', 'มดลูง'],
      specialtyId: 7, // สูตินรีเวช
      confidence: 0.8
    },
    {
      keywords: ['หัวใจ', 'เต้น', 'หายใจ', 'เหนื่อย', 'บวม', 'ปวดหน้าอก'],
      specialtyId: 8, // โรคหัวใจ
      confidence: 0.8
    },
    {
      keywords: ['ผื่น', 'คัน', 'ผิว', 'สิว', 'แพ้', 'ผิวหนัง'],
      specialtyId: 9, // ผิวหนัง
      confidence: 0.9
    },
    {
      keywords: ['เครียด', 'ซึมเศร้า', 'นอนไม่หลับ', 'วิตกกังวล', 'อารมณ์'],
      specialtyId: 10, // จิตเวช
      confidence: 0.7
    }
  ];

  // หาความตรงกับอาการ
  let bestMatch = { specialtyId: undefined, confidence: 0 };

  for (const mapping of symptomMap) {
    let matchCount = 0;
    for (const keyword of mapping.keywords) {
      if (symptomLower.includes(keyword)) {
        matchCount++;
      }
    }

    if (matchCount > 0) {
      const confidence = (matchCount / mapping.keywords.length) * mapping.confidence;
      if (confidence > bestMatch.confidence) {
        bestMatch = {
          specialtyId: mapping.specialtyId,
          confidence
        };
      }
    }
  }

  return bestMatch;
};

/**
 * ตรวจสอบว่าเป็นกรณีเร่งด่วนหรือไม่
 */
const checkIfUrgent = (symptoms: string): boolean => {
  const urgentKeywords = [
    'ฉุกเฉิน', 'เร่งด่วน', 'เจ็บมาก', 'ปวดมาก', 'ไข้สูง',
    'หายใจไม่ออก', 'เลือดออก', 'สลบ', 'ชัก', 'แน่นหน้าอก'
  ];

  const symptomLower = symptoms.toLowerCase();
  return urgentKeywords.some(keyword => symptomLower.includes(keyword));
};