import React from 'react'
import Layout from '../common/Layout'
import Sidebar from './Sidebar'

const ChangePasword = () => {
  return (
    <Layout>
    <div className="py-8">
            <div className="container mx-auto px-4 max-w-[1440px]">
                <div className="flex flex-col md:flex-row gap-8">
                    {/* Sidebar */}
                    <Sidebar/>

                    {/* Main Content */}
                    <main className="flex-1">
                        <div className="space-y-6">                             
                            <div className="bg-white shadow rounded-lg p-6">
                                <h3 className="text-lg font-medium text-gray-900 mb-4">Change Password</h3>
                                <div className="space-y-4 max-w-md">
                                    <div>
                                        <label htmlFor="currentPassword" className="block text-sm font-medium text-gray-700 mb-1">
                                            Current Password
                                        </label>
                                        <div className="relative">
                                            <input
                                                id="currentPassword"
                                                name="currentPassword"
                                                type="password"
                                                required
                                                className="mt-1 block w-full px-3 py-2 bg-white border border-gray-300 rounded-md text-sm shadow-sm placeholder-gray-400
                                                focus:outline-none focus:border-primary-color focus:ring-1 focus:ring-primary-color"
                                                placeholder="Enter your current password"
                                            />
                                        </div>
                                    </div>
                                    <div>
                                        <label htmlFor="newPassword" className="block text-sm font-medium text-gray-700 mb-1">
                                            New Password
                                        </label>
                                        <div className="relative">
                                            <input
                                                id="newPassword"
                                                name="newPassword"
                                                type="password"
                                                required
                                                minLength={8}
                                                className="mt-1 block w-full px-3 py-2 bg-white border border-gray-300 rounded-md text-sm shadow-sm placeholder-gray-400
                                                focus:outline-none focus:border-primary-color focus:ring-1 focus:ring-primary-color"
                                                placeholder="Enter your new password"
                                            />
                                        </div>
                                        <p className="mt-1 text-xs text-gray-500">Minimum 8 characters</p>
                                    </div>
                                    <div>
                                        <label htmlFor="confirmPassword" className="block text-sm font-medium text-gray-700 mb-1">
                                            Confirm New Password
                                        </label>
                                        <div className="relative">
                                            <input
                                                id="confirmPassword"
                                                name="confirmPassword"
                                                type="password"
                                                required
                                                className="mt-1 block w-full px-3 py-2 bg-white border border-gray-300 rounded-md text-sm shadow-sm placeholder-gray-400
                                                focus:outline-none focus:border-primary-color focus:ring-1 focus:ring-primary-color"
                                                placeholder="Confirm your new password"
                                            />
                                        </div>
                                    </div>
                                    <div className="pt-4">
                                        <button className="bg-primary-color text-white px-4 py-2 rounded-md hover:bg-secondary-color focus:outline-none focus:ring-2 focus:ring-primary-color focus:ring-offset-2">
                                            Update Password
                                        </button>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </main>
                </div>
            </div>
        </div>      
        </Layout>
    
  )
}

export default ChangePasword
