"use client";

export default function StatCard({ title, value, icon }) {
    return (
        <div className="flex items-center justify-between bg-white px-6 py-5 rounded-2xl border border-gray-200 shadow-sm w-full">
            {/* Icon */}
            <div className="flex items-center gap-4">
                <div className="w-12 h-12 flex items-center justify-center rounded-xl bg-red-50">
                    <div className="text-red-500 text-lg">{icon}</div>
                </div>
                <p className="text-lg font-medium text-black">{title}</p>
            </div>

            <div className="flex justify-around items-center">
                <h2 className="text-2xl font-bold text-gray-900 tracking-tight">
                    {value}
                </h2>
            </div>
        </div>
    );
}
