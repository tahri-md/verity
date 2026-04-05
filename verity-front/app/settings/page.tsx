'use client'

import { useState } from 'react'
import PrivateLayout from '@/components/PrivateLayout'

export default function SettingsPage() {
  const [settings, setSettings] = useState({
    theme: localStorage.getItem('theme') || 'dark',
    emailNotifications: true,
    pushNotifications: false,
    twoFactorAuth: false,
    itemsPerPage: '10',
    dateFormat: 'MM/DD/YYYY',
  })

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target
    const newValue = type === 'checkbox' ? (e.target as HTMLInputElement).checked : value

    setSettings((prev) => ({
      ...prev,
      [name]: newValue,
    }))

    if (name === 'theme') {
      document.documentElement.setAttribute('data-theme', value)
      localStorage.setItem('theme', value)
    }
  }

  return (
    <PrivateLayout>
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <h1 className="text-3xl font-bold text-primary mb-8">Settings</h1>

        <div className="space-y-6">
          {/* Theme Settings */}
          <div className="card">
            <h2 className="text-xl font-bold text-primary mb-6">Appearance</h2>

            <div>
              <label className="block text-sm font-medium mb-3">Theme</label>
              <select
                name="theme"
                value={settings.theme}
                onChange={handleChange}
                className="input-field w-full md:w-1/3"
              >
                <option value="light">Light</option>
                <option value="dark">Dark</option>
                <option value="auto">Auto</option>
              </select>
            </div>
          </div>

          {/* Notification Settings */}
          <div className="card">
            <h2 className="text-xl font-bold text-primary mb-6">Notifications</h2>

            <div className="space-y-4">
              <div className="flex items-center gap-3">
                <input
                  type="checkbox"
                  id="emailNotifications"
                  name="emailNotifications"
                  checked={settings.emailNotifications}
                  onChange={handleChange}
                  className="w-4 h-4 rounded"
                />
                <label htmlFor="emailNotifications" className="cursor-pointer">
                  <p className="font-medium">Email Notifications</p>
                  <p className="text-sm text-muted">Receive updates via email</p>
                </label>
              </div>

              <div className="flex items-center gap-3">
                <input
                  type="checkbox"
                  id="pushNotifications"
                  name="pushNotifications"
                  checked={settings.pushNotifications}
                  onChange={handleChange}
                  className="w-4 h-4 rounded"
                />
                <label htmlFor="pushNotifications" className="cursor-pointer">
                  <p className="font-medium">Push Notifications</p>
                  <p className="text-sm text-muted">Get browser notifications</p>
                </label>
              </div>
            </div>
          </div>

          {/* Security Settings */}
          <div className="card">
            <h2 className="text-xl font-bold text-primary mb-6">Security</h2>

            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="font-medium">Two-Factor Authentication</p>
                  <p className="text-sm text-muted">Add an extra layer of security</p>
                </div>
                <input
                  type="checkbox"
                  name="twoFactorAuth"
                  checked={settings.twoFactorAuth}
                  onChange={handleChange}
                  className="w-4 h-4 rounded"
                />
              </div>

              <div className="border-t border-border pt-4">
                <button className="btn btn-secondary">Change Password</button>
              </div>
            </div>
          </div>

          {/* Preferences */}
          <div className="card">
            <h2 className="text-xl font-bold text-primary mb-6">Preferences</h2>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium mb-3">Items Per Page</label>
                <select
                  name="itemsPerPage"
                  value={settings.itemsPerPage}
                  onChange={handleChange}
                  className="input-field w-full"
                >
                  <option value="10">10</option>
                  <option value="25">25</option>
                  <option value="50">50</option>
                  <option value="100">100</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium mb-3">Date Format</label>
                <select
                  name="dateFormat"
                  value={settings.dateFormat}
                  onChange={handleChange}
                  className="input-field w-full"
                >
                  <option value="MM/DD/YYYY">MM/DD/YYYY</option>
                  <option value="DD/MM/YYYY">DD/MM/YYYY</option>
                  <option value="YYYY-MM-DD">YYYY-MM-DD</option>
                </select>
              </div>
            </div>
          </div>

          <div className="flex gap-4 mt-8">
            <button className="btn btn-primary">Save Settings</button>
            <button className="btn btn-ghost">Reset to Defaults</button>
          </div>
        </div>
      </div>
    </PrivateLayout>
  )
}
