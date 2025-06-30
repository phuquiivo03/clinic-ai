import { SchemaType, type FunctionDeclaration } from '@google/generative-ai';

// Helper function to get the start (Monday) and end (Sunday) of a week for a given date
function getWeekPeriod(date: Date): { from: string; to: string } {
  const dayOfWeek = date.getDay(); // Sunday - 0, Monday - 1, ..., Saturday - 6
  const diffToMonday = dayOfWeek === 0 ? -6 : 1 - dayOfWeek; // Adjust for Sunday being 0
  const monday = new Date(date);
  monday.setDate(date.getDate() + diffToMonday);
  monday.setHours(0, 0, 0, 0); // Start of Monday

  const sunday = new Date(monday);
  sunday.setDate(monday.getDate() + 6);
  sunday.setHours(23, 59, 59, 999); // End of Sunday
  
  return {
    from: monday.toISOString(),
    to: sunday.toISOString(),
  };
}

export const scheduleConsultationTool: FunctionDeclaration = {
  name: 'scheduleConsultation',
  description:
    'Schedules a consultation package for a user. Requires package ID, preferred day of the week (Monday-Friday), and preferred time slot.',
  parameters: {
    type: SchemaType.OBJECT,
    properties: {
      packageId: {
        type: SchemaType.STRING,
        description: 'The ID of the consultation package to schedule.',
      },
      dayOffset: {
        type: SchemaType.INTEGER,
        description:
          'The offset for the day of the week: 0 for Monday, 1 for Tuesday, 2 for Wednesday, 3 for Thursday, 4 for Friday.',
      },
      timeOffset: {
        type: SchemaType.INTEGER,
        description:
          'The offset for the time slot: 0 for 8 AM, 1 for 9 AM, 2 for 10 AM, 3 for 11 AM, 4 for 1 PM, 5 for 2 PM, 6 for 3 PM, 7 for 4 PM.',
      },
      targetDate: {
        type: SchemaType.STRING,
        description:
          '(Optional) A specific date (YYYY-MM-DD) to target for the scheduling week. If not provided, the current week is used.',
      },
    },
    required: ['packageId', 'dayOffset', 'timeOffset'],
  },
};

interface ScheduleParams {
  packageId: string;
  dayOffset: number;
  timeOffset: number;
  targetDate?: string;
}

export async function scheduleConsultation(
  authenToken: string,
  params: ScheduleParams
): Promise<object> {
  const { packageId, dayOffset, timeOffset, targetDate } = params;

  const dateForWeek = targetDate ? new Date(targetDate) : new Date();
  if (targetDate && isNaN(dateForWeek.getTime())) {
    return { error: 'Invalid targetDate format. Please use YYYY-MM-DD.' };
  }

  const weekPeriod = getWeekPeriod(dateForWeek);
  const status = 'pending'; // Static as per requirement

  const payload = {
    weekPeriod,
    dayOffset,
    timeOffset,
    status,
    packageId,
  };

  console.log(
    'Scheduling consultation with payload:',
    JSON.stringify(payload, null, 2)
  );

  try {
    const response = await fetch('http://localhost:8081/api/v1/schedule', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: authenToken, // As per cURL example, empty. Clarify if a real token is needed.
      },
      body: JSON.stringify(payload),
    });

    const responseData = await response.json();

    if (!response.ok) {
      console.error(
        `Schedule API call failed with status: ${response.status}`,
        responseData
      );
      return {
        error: `Failed to schedule consultation, status: ${response.status}`,
        details: responseData,
      };
    }
    console.log('Consultation scheduled successfully:', responseData);
    return { success: true, data: responseData };
  } catch (error) {
    console.error('Error scheduling consultation:', error);
    return {
      error:
        'Failed to schedule consultation due to a network or parsing error.',
      details: error instanceof Error ? error.message : String(error),
    };
  }
}
