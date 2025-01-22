"use client";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import AuthLayout from "../../components/auth/AuthLayout";
import {
  getAllSupplyTypes,
  createOrganization,
} from "../../utils/firebase-utils";
import { COUNTRIES } from "../../data/countries";

export default function Signup() {
  const router = useRouter();
  const [step, setStep] = useState(1);
  const [formData, setFormData] = useState({
    organizationName: "",
    email: "",
    password: "",
    confirmPassword: "",
    website: "",
    contactPhone: "",
    supplyTypes: [],
    countries: [],
  });
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [supplyTypes, setSupplyTypes] = useState([]);

  useEffect(() => {
    const loadSupplyTypes = async () => {
      try {
        const types = await getAllSupplyTypes();
        setSupplyTypes(types);
      } catch (error) {
        console.error("Error loading supply types:", error);
        setError("Failed to load supply types");
      }
    };

    loadSupplyTypes();
  }, []);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleMultiSelect = (e, field) => {
    const options = e.target.options;
    const selected = [];
    for (let i = 0; i < options.length; i++) {
      if (options[i].selected) {
        selected.push(options[i].value);
      }
    }
    setFormData((prev) => ({
      ...prev,
      [field]: selected,
    }));
  };

  const handleNext = (e) => {
    e.preventDefault();
    setError("");

    // Validate first step
    if (
      !formData.organizationName ||
      !formData.email ||
      !formData.password ||
      !formData.confirmPassword
    ) {
      setError("Please fill in all required fields");
      return;
    }

    if (formData.password !== formData.confirmPassword) {
      setError("Passwords do not match");
      return;
    }

    setStep(2);
  };

  const handleBack = () => {
    setStep(1);
    setError("");
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      await createOrganization(formData);
      router.push("/");
    } catch (error) {
      setError(error.message);
      setLoading(false);
    }
  };

  return (
    <AuthLayout>
      <div className="text-center mb-8">
        <h2 className="text-2xl font-bold text-gray-900">
          Create an organization account
        </h2>
        <div className="mt-2 text-sm text-gray-600">
          Step {step} of 2:{" "}
          {step === 1 ? "Basic Information" : "Organization Details"}
        </div>
      </div>

      {error && (
        <div className="bg-red-50 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
          {error}
        </div>
      )}

      {step === 1 ? (
        <form onSubmit={handleNext} className="space-y-6">
          <div>
            <label
              htmlFor="organizationName"
              className="block text-sm font-medium text-black"
            >
              Organization Name
            </label>
            <div className="mt-1">
              <input
                id="organizationName"
                name="organizationName"
                type="text"
                required
                value={formData.organizationName}
                onChange={handleChange}
                className="appearance-none block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm text-black"
              />
            </div>
          </div>

          <div>
            <label
              htmlFor="email"
              className="block text-sm font-medium text-black"
            >
              Email address
            </label>
            <div className="mt-1">
              <input
                id="email"
                name="email"
                type="email"
                autoComplete="email"
                required
                value={formData.email}
                onChange={handleChange}
                className="appearance-none block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm text-black"
              />
            </div>
          </div>

          <div>
            <label
              htmlFor="password"
              className="block text-sm font-medium text-black"
            >
              Password
            </label>
            <div className="mt-1">
              <input
                id="password"
                name="password"
                type="password"
                required
                value={formData.password}
                onChange={handleChange}
                className="appearance-none block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm text-black"
              />
            </div>
          </div>

          <div>
            <label
              htmlFor="confirmPassword"
              className="block text-sm font-medium text-black"
            >
              Confirm Password
            </label>
            <div className="mt-1">
              <input
                id="confirmPassword"
                name="confirmPassword"
                type="password"
                required
                value={formData.confirmPassword}
                onChange={handleChange}
                className="appearance-none block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm text-black"
              />
            </div>
          </div>

          <div>
            <button
              type="submit"
              className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
            >
              Next
            </button>
          </div>
        </form>
      ) : (
        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label
              htmlFor="supplyTypes"
              className="block text-sm font-medium text-black"
            >
              Supply Types (Hold Ctrl/Cmd to select multiple)
            </label>
            <div className="mt-1">
              <select
                id="supplyTypes"
                multiple
                value={formData.supplyTypes}
                onChange={(e) => handleMultiSelect(e, "supplyTypes")}
                className="appearance-none block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm text-black min-h-[120px]"
              >
                {supplyTypes.map((type) => (
                  <option
                    key={type.id}
                    value={type.id}
                    className="text-black py-1"
                  >
                    {type.name}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div>
            <label
              htmlFor="countries"
              className="block text-sm font-medium text-black"
            >
              Operating Countries (Hold Ctrl/Cmd to select multiple)
            </label>
            <div className="mt-1">
              <select
                id="countries"
                multiple
                value={formData.countries}
                onChange={(e) => handleMultiSelect(e, "countries")}
                className="appearance-none block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm text-black min-h-[120px]"
              >
                {COUNTRIES.map((country) => (
                  <option
                    key={country.code}
                    value={country.code}
                    className="text-black py-1"
                  >
                    {country.name}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div>
            <label
              htmlFor="website"
              className="block text-sm font-medium text-black"
            >
              Website (optional)
            </label>
            <div className="mt-1">
              <input
                id="website"
                name="website"
                type="url"
                value={formData.website}
                onChange={handleChange}
                className="appearance-none block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm text-black"
              />
            </div>
          </div>

          <div>
            <label
              htmlFor="contactPhone"
              className="block text-sm font-medium text-black"
            >
              Contact Phone (optional)
            </label>
            <div className="mt-1">
              <input
                id="contactPhone"
                name="contactPhone"
                type="tel"
                value={formData.contactPhone}
                onChange={handleChange}
                className="appearance-none block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm text-black"
              />
            </div>
          </div>

          <div className="flex gap-4">
            <button
              type="button"
              onClick={handleBack}
              className="flex-1 py-2 px-4 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-black bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
            >
              Back
            </button>
            <button
              type="submit"
              disabled={loading}
              className="flex-1 py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50"
            >
              {loading ? "Creating account..." : "Create account"}
            </button>
          </div>
        </form>
      )}

      <div className="mt-6">
        <div className="text-center">
          <p className="text-sm text-gray-600">
            Already have an account?{" "}
            <Link
              href="/auth/login"
              className="font-medium text-blue-600 hover:text-blue-500"
            >
              Sign in
            </Link>
          </p>
        </div>
      </div>
    </AuthLayout>
  );
}
