// src/pages/nurse/Profile.jsx

import { useEffect, useState } from 'react'

import {
  Lock,
  Mail,
  Phone,
  ShieldCheck,
  User2,
} from 'lucide-react'

import {
  getNurseProfile,
  updateNurseProfile,
  updateNursePassword,
} from '../../api/nurse'

export default function Profile() {
  const [profile, setProfile] = useState(null)

  const [passwords, setPasswords] = useState({
    old_password: '',
    new_password: '',
  })

  useEffect(() => {
    async function loadProfile() {
      try {
        const data = await getNurseProfile()

        setProfile(data)

      } catch (err) {
        console.error(err)
      }
    }

    loadProfile()
  }, [])

  async function handleProfileUpdate(e) {
    e.preventDefault()

    try {
      await updateNurseProfile(profile)

      alert('Profile updated')

    } catch (err) {
      console.error(err)
    }
  }

  async function handlePasswordUpdate(e) {
    e.preventDefault()

    try {
      await updateNursePassword(passwords)

      alert('Password updated')

      setPasswords({
        old_password: '',
        new_password: '',
      })

    } catch (err) {
      console.error(err)
    }
  }

  return (
    <div className="space-y-6">

      {/* HEADER */}
      <div>
        <h1 className="text-xl font-semibold text-gray-900">
          Profile
        </h1>

        <p className="text-sm text-gray-400 mt-0.5">
          Manage your nursing account settings
        </p>
      </div>

      {/* HERO */}
      <div className="
        bg-white
        border
        border-gray-200
        rounded-3xl
        p-6
      ">

        <div className="
          flex
          flex-col
          md:flex-row
          md:items-center
          gap-5
        ">

          <div className="
            w-24
            h-24
            rounded-3xl
            bg-blue-100
            text-blue-700
            flex
            items-center
            justify-center
            text-3xl
            font-semibold
          ">
            {profile?.full_name?.[0] || 'N'}
          </div>

          <div>
            <h2 className="
              text-2xl
              font-semibold
              text-gray-900
            ">
              {profile?.full_name || 'Nurse'}
            </h2>

            <p className="
              text-sm
              text-gray-400
              mt-1
            ">
              Registered Nursing Staff
            </p>

            <div className="
              mt-4
              flex
              flex-wrap
              gap-2
            ">
              <span className="
                px-3
                py-1
                rounded-full
                text-xs
                font-semibold
                bg-blue-100
                text-blue-700
              ">
                Healthcare Staff
              </span>

              <span className="
                px-3
                py-1
                rounded-full
                text-xs
                font-semibold
                bg-teal-100
                text-teal-700
              ">
                Active Access
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* GRID */}
      <div className="
        grid
        grid-cols-1
        xl:grid-cols-2
        gap-5
      ">

        {/* PROFILE */}
        <form
          onSubmit={handleProfileUpdate}
          className="
            bg-white
            border
            border-gray-200
            rounded-3xl
            p-6
            space-y-5
          "
        >

          <div>
            <h3 className="
              font-semibold
              text-gray-900
            ">
              Personal Information
            </h3>

            <p className="
              text-sm
              text-gray-400
              mt-1
            ">
              Update your account details
            </p>
          </div>

          <Input
            icon={User2}
            label="Full Name"
            value={profile?.full_name || ''}
            onChange={(e) =>
              setProfile({
                ...profile,
                full_name: e.target.value,
              })
            }
          />

          <Input
            icon={Mail}
            label="Email"
            value={profile?.email || ''}
            onChange={(e) =>
              setProfile({
                ...profile,
                email: e.target.value,
              })
            }
          />

          <Input
            icon={Phone}
            label="Phone"
            value={profile?.phone || ''}
            onChange={(e) =>
              setProfile({
                ...profile,
                phone: e.target.value,
              })
            }
          />

          <button
            className="
              px-5
              py-3
              rounded-xl
              bg-blue-600
              text-white
              text-sm
              font-medium
              hover:bg-blue-700
            "
          >
            Save Changes
          </button>
        </form>

        {/* PASSWORD */}
        <form
          onSubmit={handlePasswordUpdate}
          className="
            bg-white
            border
            border-gray-200
            rounded-3xl
            p-6
            space-y-5
          "
        >

          <div>
            <h3 className="
              font-semibold
              text-gray-900
            ">
              Security
            </h3>

            <p className="
              text-sm
              text-gray-400
              mt-1
            ">
              Change your account password
            </p>
          </div>

          <Input
            type="password"
            icon={Lock}
            label="Current Password"
            value={passwords.old_password}
            onChange={(e) =>
              setPasswords({
                ...passwords,
                old_password: e.target.value,
              })
            }
          />

          <Input
            type="password"
            icon={ShieldCheck}
            label="New Password"
            value={passwords.new_password}
            onChange={(e) =>
              setPasswords({
                ...passwords,
                new_password: e.target.value,
              })
            }
          />

          <button
            className="
              px-5
              py-3
              rounded-xl
              bg-teal-600
              text-white
              text-sm
              font-medium
              hover:bg-teal-700
            "
          >
            Update Password
          </button>
        </form>
      </div>
    </div>
  )
}

function Input({
  label,
  icon: Icon,
  ...props
}) {
  return (
    <div>
      <label className="
        text-sm
        font-medium
        text-gray-700
        mb-2
        block
      ">
        {label}
      </label>

      <div className="relative">
        <Icon className="
          absolute
          left-3
          top-1/2
          -translate-y-1/2
          w-4
          h-4
          text-gray-400
        " />

        <input
          {...props}
          className="
            w-full
            pl-10
            pr-3
            py-2.5
            text-sm
            border
            border-gray-200
            rounded-xl
            outline-none
            focus:border-blue-400
            focus:ring-1
            focus:ring-blue-100
          "
        />
      </div>
    </div>
  )
}