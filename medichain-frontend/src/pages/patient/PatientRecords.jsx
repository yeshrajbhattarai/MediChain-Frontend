import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  Activity,
  FileText,
  FlaskConical,
  Calendar,
  Hospital,
  ChevronRight,
  Search,
  Filter,
  AlertCircle,
} from "lucide-react";

import { getPatientRecords } from "../../api/patient";

export default function PatientRecordsPage() {
  const navigate = useNavigate();

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [records, setRecords] = useState([]);
  const [search, setSearch] = useState("");
  const [filter, setFilter] = useState("all");

  useEffect(() => {
    fetchRecords();
  }, []);

  const fetchRecords = async () => {
    try {
      setLoading(true);
      setError("");

      const data = await getPatientRecords();

      // API STRUCTURE:
      // records_by_hospital -> requests[]

      const flattenedRecords = (
        data?.records_by_hospital || []
      ).flatMap((hospital) =>
        (hospital.requests || []).map((req) => ({
          ...req,
          hospital_name:
            hospital.hospital_name ||
            hospital.hospital ||
            "Unknown Hospital",
        }))
      );

      setRecords(flattenedRecords);
    } catch (err) {
      console.error(err);
      setError("Failed to load records");
    } finally {
      setLoading(false);
    }
  };

  const filteredRecords = useMemo(() => {
    return records.filter((record) => {
      const text = JSON.stringify(record).toLowerCase();

      const matchesSearch = text.includes(search.toLowerCase());

      const isMedical =
        !!record.primary_diagnosis ||
        !!record.blood_pressure ||
        !!record.prescription;

      const type = isMedical ? "medical" : "lab";

      const matchesFilter =
        filter === "all" ? true : filter === type;

      return matchesSearch && matchesFilter;
    });
  }, [records, search, filter]);

  const openRecord = (record) => {
    navigate(`/patient/records/${record.record_id}`);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-50 p-6">
        <div className="max-w-7xl mx-auto">
          <div className="animate-pulse space-y-4">
            <div className="h-10 w-72 bg-slate-200 rounded-xl" />
            <div className="grid gap-5">
              {[1, 2, 3, 4].map((i) => (
                <div
                  key={i}
                  className="bg-white rounded-2xl h-40 border border-slate-200"
                />
              ))}
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 p-4 md:p-6">
      <div className="max-w-7xl mx-auto">
        {/* HEADER */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-slate-900">
            My Medical Records
          </h1>

          <p className="text-slate-500 mt-2">
            Access all your medical and laboratory reports
          </p>
        </div>

        {/* SEARCH + FILTER */}
        <div className="bg-white border border-slate-200 rounded-2xl p-4 mb-6 shadow-sm">
          <div className="flex flex-col lg:flex-row gap-4">
            {/* SEARCH */}
            <div className="relative flex-1">
              <Search
                size={18}
                className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400"
              />

              <input
                type="text"
                placeholder="Search records..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-full pl-11 pr-4 py-3 rounded-xl border border-slate-200 outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            {/* FILTER */}
            <div className="flex items-center gap-2">
              <Filter size={18} className="text-slate-500" />

              <select
                value={filter}
                onChange={(e) => setFilter(e.target.value)}
                className="px-4 py-3 rounded-xl border border-slate-200 outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="all">All Records</option>
                <option value="medical">Medical Records</option>
                <option value="lab">Lab Reports</option>
              </select>
            </div>
          </div>
        </div>

        {/* ERROR */}
        {error && (
          <div className="bg-red-50 border border-red-200 rounded-2xl p-4 mb-6 flex items-center gap-3 text-red-700">
            <AlertCircle size={20} />
            {error}
          </div>
        )}

        {/* EMPTY */}
        {!loading && filteredRecords.length === 0 && (
          <div className="bg-white border border-slate-200 rounded-3xl p-12 text-center">
            <FileText
              size={50}
              className="mx-auto text-slate-300 mb-4"
            />

            <h3 className="text-xl font-semibold text-slate-800">
              No Records Found
            </h3>

            <p className="text-slate-500 mt-2">
              Your records will appear here once uploaded.
            </p>
          </div>
        )}

        {/* RECORDS */}
        <div className="grid gap-5">
          {filteredRecords.map((record) => {
            const isMedical =
              !!record.primary_diagnosis ||
              !!record.blood_pressure ||
              !!record.prescription;

            return (
              <div
                key={record.record_id || record.id}
                onClick={() => openRecord(record)}
                className="group bg-white border border-slate-200 rounded-3xl p-6 hover:shadow-xl hover:border-blue-200 transition-all duration-300 cursor-pointer"
              >
                <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
                  {/* LEFT */}
                  <div className="flex gap-5">
                    {/* ICON */}
                    <div
                      className={`w-16 h-16 rounded-2xl flex items-center justify-center shrink-0 ${
                        isMedical
                          ? "bg-blue-100 text-blue-600"
                          : "bg-emerald-100 text-emerald-600"
                      }`}
                    >
                      {isMedical ? (
                        <Activity size={28} />
                      ) : (
                        <FlaskConical size={28} />
                      )}
                    </div>

                    {/* DETAILS */}
                    <div>
                      <div className="flex flex-wrap items-center gap-3 mb-3">
                        <span
                          className={`px-3 py-1 rounded-full text-xs font-semibold ${
                            isMedical
                              ? "bg-blue-100 text-blue-700"
                              : "bg-emerald-100 text-emerald-700"
                          }`}
                        >
                          {isMedical
                            ? "Medical Record"
                            : "Lab Report"}
                        </span>

                        {record.status && (
                          <span className="px-3 py-1 rounded-full bg-slate-100 text-slate-600 text-xs font-medium capitalize">
                            {record.status}
                          </span>
                        )}
                      </div>

                      <h2 className="text-xl font-semibold text-slate-900">
                        {record.primary_diagnosis ||
                          record.test_name ||
                          "Patient Record"}
                      </h2>

                      <div className="mt-4 flex flex-wrap gap-4 text-sm text-slate-500">
                        <div className="flex items-center gap-2">
                          <Hospital size={16} />
                          {record.hospital_name}
                        </div>

                        {record.created_at && (
                          <div className="flex items-center gap-2">
                            <Calendar size={16} />
                            {new Date(
                              record.created_at
                            ).toLocaleDateString()}
                          </div>
                        )}
                      </div>

                      {/* MEDICAL */}
                      {isMedical && (
                        <div className="mt-5 grid md:grid-cols-3 gap-3">
                          {record.blood_pressure && (
                            <div className="bg-slate-50 rounded-xl p-3">
                              <p className="text-xs text-slate-500">
                                Blood Pressure
                              </p>

                              <p className="font-semibold text-slate-900">
                                {record.blood_pressure}
                              </p>
                            </div>
                          )}

                          {record.heart_rate && (
                            <div className="bg-slate-50 rounded-xl p-3">
                              <p className="text-xs text-slate-500">
                                Heart Rate
                              </p>

                              <p className="font-semibold text-slate-900">
                                {record.heart_rate}
                              </p>
                            </div>
                          )}

                          {record.temperature && (
                            <div className="bg-slate-50 rounded-xl p-3">
                              <p className="text-xs text-slate-500">
                                Temperature
                              </p>

                              <p className="font-semibold text-slate-900">
                                {record.temperature}
                              </p>
                            </div>
                          )}
                        </div>
                      )}

                      {/* LAB */}
                      {!isMedical && record.summary && (
                        <div className="mt-5 bg-slate-50 rounded-xl p-4">
                          <p className="text-sm text-slate-600 line-clamp-2">
                            {record.summary}
                          </p>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* RIGHT */}
                  <div className="flex items-center">
                    <div className="w-12 h-12 rounded-xl bg-slate-100 group-hover:bg-blue-100 flex items-center justify-center transition-all">
                      <ChevronRight className="text-slate-600 group-hover:text-blue-600" />
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}