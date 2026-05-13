import { get, patch, post } from './client'

const normalizeError = async (err) => {
  try {
    const data = await err?.response?.json?.()
    return data?.detail || data?.message || 'Something went wrong'
  } catch {
    return err?.message || 'Something went wrong'
  }
}

export const getNurseQueue = async (status = null) => {
  try {
    const query = status
      ? `?status=${encodeURIComponent(
          Array.isArray(status)
            ? status.join(',')
            : status
        )}`
      : ''

    return await get(`/api/v1/staff/nurse/queue/${query}`)
  } catch (err) {
    throw new Error(await normalizeError(err))
  }
}

export const getNurseQueueItem = async (itemId) => {
  try {
    return await get(`/api/v1/staff/nurse/queue/${itemId}/`)
  } catch (err) {
    throw new Error(await normalizeError(err))
  }
}

export const completeNurseQueueItem = async (itemId, data) => {
  try {
    return await post(`/api/v1/staff/nurse/queue/${itemId}/`, {
      blood_pressure: data.blood_pressure,
      pulse_rate: parseInt(data.pulse_rate, 10),
      temperature_c: parseFloat(data.temperature_c),
      spo2_percent: parseInt(data.spo2_percent, 10),
      random_blood_sugar: data.random_blood_sugar || '',
      nurse_tests_performed: data.nurse_tests_performed,
      nurse_observation: data.nurse_observation,
      treatment_given: data.treatment_given,
      medications_administered: data.medications_administered,
      follow_up_notes: data.follow_up_notes || '',
    })
  } catch (err) {
    throw new Error(await normalizeError(err))
  }
}

export const getNurseProfile = async () => {
  try {
    return await get('/api/v1/staff/nurse/profile/')
  } catch (err) {
    throw new Error(await normalizeError(err))
  }
}

const ALL_QUEUE_STATUSES = [
  'pending',
  'in_progress',
  'completed',
]

export const getNursePatients = async () => {
  try {
    const queue = await getNurseQueue(ALL_QUEUE_STATUSES)

    const list = Array.isArray(queue)
      ? queue
      : []

    const unique = new Map()

    list.forEach((item) => {
      const p = item?.patient

      if (!p?.id) return

      if (!unique.has(p.id)) {
        unique.set(p.id, {
          ...p,
          condition: item?.primary_diagnosis || '',
          notes: item?.nurse_observation || '',
        })
      }
    })

    return Array.from(unique.values())
  } catch (err) {
    throw new Error(await normalizeError(err))
  }
}

export const getNursePatientDetail = async (patientId) => {
  try {
    const queue = await getNurseQueue(
      ALL_QUEUE_STATUSES
    )

    const list = Array.isArray(queue)
      ? queue
      : []

    const matched = list.filter(
      (item) =>
        String(item?.patient?.id) ===
        String(patientId)
    )

    if (!matched.length) {
      const error = new Error(
        'Patient not found in your assigned queue'
      )

      error.status = 404

      throw error
    }

    const latest = matched
      .slice()
      .sort(
        (a, b) =>
          new Date(b?.created_at || 0) -
          new Date(a?.created_at || 0)
      )[0]

    return {
      ...(latest?.patient || {}),
      condition:
        latest?.primary_diagnosis || '',
      notes:
        latest?.nurse_observation || '',

      queue_summary: matched.map((item) => ({
        id: item.id,
        status: item.status,
        title: item.title,
        primary_diagnosis:
          item.primary_diagnosis,
        created_at: item.created_at,
      })),
    }
  } catch (err) {
    throw new Error(await normalizeError(err))
  }
}

export const updateNurseProfile = async (
  data
) => {
  try {
    return await patch(
      '/api/v1/staff/nurse/profile/update-personal/',
      {
        date_of_birth:
          data.date_of_birth || null,

        gender: data.gender || '',

        years_experience:
          data.years_experience || null,

        license_number:
          data.license_number || '',

        home_address:
          data.home_address || '',

        bio: data.bio || '',
      }
    )
  } catch (err) {
    throw new Error(await normalizeError(err))
  }
}

export const updateNursePassword = async (
  data
) => {
  try {
    return await patch(
      '/api/v1/staff/nurse/profile/update-password/',
      {
        current_password:
          data.old_password ||
          data.current_password,

        new_password:
          data.new_password,

        confirm_new_password:
          data.confirm_new_password ||
          data.new_password,
      }
    )
  } catch (err) {
    throw new Error(await normalizeError(err))
  }
}

export const getNurseMedicalRecords = async (
  filters = {}
) => {
  try {
    const records = await get(
      '/api/v1/staff/nurse/records/'
    )

    if (!Array.isArray(records)) {
      return []
    }

    if (
      !filters.gov_id_type &&
      !filters.gov_id_number
    ) {
      return records
    }

    return records.filter((row) => {
      const typeMatches =
        !filters.gov_id_type ||
        row?.patient?.gov_id_type ===
          filters.gov_id_type

      const numberMatches =
        !filters.gov_id_number ||
        String(
          row?.patient?.gov_id_number || ''
        ).includes(
          String(filters.gov_id_number)
        )

      return (
        typeMatches && numberMatches
      )
    })
  } catch (err) {
    throw new Error(await normalizeError(err))
  }
}

export const getNurseMedicalRecordDetail =
  async (
    recordId,
    versionNumber = null
  ) => {
    try {
      const query = versionNumber
        ? `?v=${encodeURIComponent(
            versionNumber
          )}`
        : ''

      return await get(
        `/api/v1/staff/nurse/records/${recordId}/${query}`
      )
    } catch (err) {
      throw new Error(
        await normalizeError(err)
      )
    }
  }

export const getNurseDashboard =
  async () => {
    try {
      const queue =
        await getNurseQueue()

      const list = Array.isArray(queue)
        ? queue
        : []

      const assigned_tasks =
        list.length

      const pending_tasks =
        list.filter(
          (item) =>
            item.status === 'pending'
        ).length

      const completed_today =
        list.filter(
          (item) =>
            item.status === 'completed'
        ).length

      const uniquePatients =
        new Set(
          list
            .map(
              (item) =>
                item?.patient?.id
            )
            .filter(Boolean)
        )

      return {
        assigned_tasks,
        pending_tasks,
        completed_today,

        total_patients:
          uniquePatients.size,

        recent_tasks: list.slice(0, 5),
      }
    } catch (err) {
      throw new Error(
        await normalizeError(err)
      )
    }
  }