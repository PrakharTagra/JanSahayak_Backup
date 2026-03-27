import { useState } from "react";

export default function VolunteerForm() {
  const [formData, setFormData] = useState({
    name: "",
    phone: "",
    address: "",
    bank: "",
    price: "",
    days: "",
    photo: null,
  });

  const handleChange = (e) => {
    const { name, value, files } = e.target;

    setFormData({
      ...formData,
      [name]: files ? files[0] : value,
    });
  };

  const handleSubmit = () => {
    console.log(formData);

    // backend
    // POST /volunteer/apply
  };

  return (
    <div className="min-h-screen bg-slate-900 text-white flex justify-center items-center px-6">
      
      <div className="bg-white/5 p-6 rounded-2xl w-full max-w-md border border-white/10">

        <h2 className="text-xl font-bold mb-4">
          Volunteer for this Issue
        </h2>

        <div className="flex flex-col gap-3">

          <input
            name="name"
            placeholder="Full Name"
            onChange={handleChange}
            className="p-3 bg-white/10 rounded-xl"
          />

          <input
            name="phone"
            placeholder="Phone Number"
            onChange={handleChange}
            className="p-3 bg-white/10 rounded-xl"
          />

          <input
            name="address"
            placeholder="Address"
            onChange={handleChange}
            className="p-3 bg-white/10 rounded-xl"
          />

          <input
            name="bank"
            placeholder="Bank Account Number"
            onChange={handleChange}
            className="p-3 bg-white/10 rounded-xl"
          />

          <input
            name="price"
            placeholder="Your Price (₹)"
            onChange={handleChange}
            className="p-3 bg-white/10 rounded-xl"
          />

          <input
            name="days"
            placeholder="Days to Resolve"
            onChange={handleChange}
            className="p-3 bg-white/10 rounded-xl"
          />

          {/* Photo Upload */}
          <div className="text-sm text-gray-400">
            Upload Your Photo
          </div>
          <input
            type="file"
            name="photo"
            onChange={handleChange}
            className="p-2"
          />

          <button
            onClick={handleSubmit}
            className="mt-2 py-3 bg-green-600 rounded-xl"
          >
            Submit Proposal
          </button>

        </div>

      </div>
    </div>
  );
}