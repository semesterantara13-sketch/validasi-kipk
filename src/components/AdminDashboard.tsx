/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { collection, query, orderBy, onSnapshot, deleteDoc, doc } from 'firebase/firestore';
import { db, auth, loginWithGoogle } from '../lib/firebase';
import { useAuthState } from 'react-firebase-hooks/auth';
import { OperationType, handleFirestoreError } from '../lib/firestore-errors';
import * as XLSX from 'xlsx';
import { 
  Download, 
  Search, 
  Trash2, 
  MoreHorizontal, 
  AlertTriangle, 
  Database,
  Users,
  FileSpreadsheet,
  Clock
} from 'lucide-react';
import { motion } from 'motion/react';

export default function AdminDashboard() {
  const [user, loading] = useAuthState(auth);
  const [registrations, setRegistrations] = React.useState<any[]>([]);
  const [searchTerm, setSearchTerm] = React.useState('');
  const [isDeleting, setIsDeleting] = React.useState<string | null>(null);

  const isAdmin = user?.email === 'juragangeprek40@gmail.com';

  React.useEffect(() => {
    if (!isAdmin) return;

    const q = query(collection(db, 'registrations'), orderBy('createdAt', 'desc'));
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const data = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));
      setRegistrations(data);
    }, (error) => {
      handleFirestoreError(error, OperationType.LIST, 'registrations');
    });

    return () => unsubscribe();
  }, [isAdmin]);

  const exportToExcel = () => {
    const exportData = registrations.map(reg => ({
      'Nomor Pendaftaran': reg.noPendaftaran,
      'NIM': reg.nim,
      'Nama': reg.nama,
      'NIK': reg.nik,
      'NISN': reg.nisn,
      'NPSN': reg.npsn,
      'Perguruan Tinggi': reg.perguruanTinggi,
      'Program Studi': reg.prodi,
      'Email': reg.email,
      'Tanggal Daftar': reg.createdAt?.toDate().toLocaleString('id-ID') || '-'
    }));

    const ws = XLSX.utils.json_to_sheet(exportData);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, 'Pendaftar KIPK');
    XLSX.writeFile(wb, `Data_Pendaftar_KIPK_${new Date().toISOString().split('T')[0]}.xlsx`);
  };

  const handleDelete = async (id: string) => {
    if (!window.confirm('Apakah Anda yakin ingin menghapus data ini?')) return;
    setIsDeleting(id);
    try {
      await deleteDoc(doc(db, 'registrations', id));
    } catch (error) {
      handleFirestoreError(error, OperationType.DELETE, `registrations/${id}`);
    } finally {
      setIsDeleting(null);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (!user || !isAdmin) {
    return (
      <div className="max-w-md mx-auto text-center py-20">
        <div className="bg-amber-50 p-6 rounded-2xl border border-amber-100 mb-6">
          <AlertTriangle className="w-12 h-12 text-amber-500 mx-auto mb-4" />
          <h2 className="text-xl font-bold text-neutral-900 mb-2">Akses Dibatasi</h2>
          <p className="text-neutral-600 mb-6">Halaman ini hanya dapat diakses oleh administrator resmi.</p>
          {!user && (
            <button 
              onClick={() => loginWithGoogle()}
              className="w-full bg-neutral-900 text-white py-3 rounded-xl font-bold hover:bg-neutral-800 transition-all"
            >
              Login sebagai Admin
            </button>
          )}
        </div>
      </div>
    );
  }

  const filteredData = registrations.filter(reg => 
    reg.nama.toLowerCase().includes(searchTerm.toLowerCase()) ||
    reg.nim.includes(searchTerm) ||
    reg.noPendaftaran.includes(searchTerm)
  );

  return (
    <div className="space-y-8">
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
        <div>
          <h1 className="text-3xl font-bold text-neutral-900 tracking-tight">Dashboard Admin</h1>
          <p className="text-neutral-500 mt-1">Pemantauan data pendaftaran KIPK secara real-time.</p>
        </div>
        <div className="flex gap-3">
          <button 
            onClick={exportToExcel}
            className="flex items-center gap-2 bg-green-600 text-white px-4 py-2.5 rounded-xl font-semibold hover:bg-green-700 transition-all shadow-sm"
          >
            <FileSpreadsheet className="w-5 h-5" />
            Ekspor ke Excel
          </button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white p-6 rounded-2xl border border-neutral-200 shadow-sm">
          <div className="flex items-center gap-4">
            <div className="bg-blue-50 p-3 rounded-xl">
              <Users className="w-6 h-6 text-blue-600" />
            </div>
            <div>
              <p className="text-sm font-medium text-neutral-500 uppercase tracking-wider">Total Pendaftar</p>
              <h3 className="text-3xl font-bold text-neutral-900">{registrations.length}</h3>
            </div>
          </div>
        </div>
        <div className="bg-white p-6 rounded-2xl border border-neutral-200 shadow-sm">
          <div className="flex items-center gap-4">
            <div className="bg-purple-50 p-3 rounded-xl">
              <Clock className="w-6 h-6 text-purple-600" />
            </div>
            <div>
              <p className="text-sm font-medium text-neutral-500 uppercase tracking-wider">Update Terakhir</p>
              <h3 className="text-lg font-bold text-neutral-900">
                {registrations[0]?.createdAt?.toDate().toLocaleTimeString('id-ID') || '-'}
              </h3>
            </div>
          </div>
        </div>
        <div className="bg-white p-6 rounded-2xl border border-neutral-200 shadow-sm">
          <div className="flex items-center gap-4">
            <div className="bg-green-50 p-3 rounded-xl">
              <Database className="w-6 h-6 text-green-600" />
            </div>
            <div>
              <p className="text-sm font-medium text-neutral-500 uppercase tracking-wider">Status Database</p>
              <h3 className="text-lg font-bold text-neutral-900">Aktif & Terkoneksi</h3>
            </div>
          </div>
        </div>
      </div>

      {/* Table Section */}
      <div className="bg-white rounded-2xl border border-neutral-200 shadow-sm overflow-hidden">
        <div className="p-6 border-b border-neutral-100 flex flex-col md:flex-row md:items-center justify-between gap-4">
          <h2 className="text-lg font-bold text-neutral-900">Daftar Pendaftar</h2>
          <div className="relative w-full md:w-80">
            <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-neutral-400" />
            <input 
              type="text"
              placeholder="Cari nama, NIM, atau nomor..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 bg-neutral-50 border border-neutral-200 rounded-lg text-sm outline-none focus:ring-2 focus:ring-blue-500 transition-all"
            />
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-neutral-50 text-neutral-500 text-xs font-semibold uppercase tracking-wider">
                <th className="px-6 py-4">Pendaftar</th>
                <th className="px-6 py-4">Nomor / NIM</th>
                <th className="px-6 py-4">Identitas</th>
                <th className="px-6 py-4">PT & Prodi</th>
                <th className="px-6 py-4">Waktu Daftar</th>
                <th className="px-6 py-4 text-center">Aksi</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-neutral-100 text-sm">
              {filteredData.length > 0 ? (
                filteredData.map((reg) => (
                  <motion.tr 
                    layout
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    key={reg.id} 
                    className="hover:bg-neutral-50 transition-colors"
                  >
                    <td className="px-6 py-4">
                      <div className="flex flex-col">
                        <span className="font-bold text-neutral-900">{reg.nama}</span>
                        <span className="text-xs text-neutral-500">{reg.email}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex flex-col">
                        <span className="font-mono text-xs bg-blue-50 text-blue-700 px-1.5 py-0.5 rounded w-fit mb-1">{reg.noPendaftaran}</span>
                        <span className="text-neutral-600">{reg.nim}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="grid grid-cols-1 gap-1 text-[11px]">
                        <span className="text-neutral-500"><b className="text-neutral-700">NIK:</b> {reg.nik}</span>
                        <span className="text-neutral-500"><b className="text-neutral-700">NISN:</b> {reg.nisn}</span>
                        <span className="text-neutral-500"><b className="text-neutral-700">NPSN:</b> {reg.npsn}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex flex-col">
                        <span className="font-medium text-neutral-900">{reg.perguruanTinggi}</span>
                        <span className="text-xs text-neutral-500">{reg.prodi}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-neutral-500 whitespace-nowrap">
                      {reg.createdAt?.toDate().toLocaleString('id-ID', { dateStyle: 'short', timeStyle: 'short' })}
                    </td>
                    <td className="px-6 py-4 text-center">
                      <button 
                        onClick={() => handleDelete(reg.id)}
                        disabled={isDeleting === reg.id}
                        className="p-2 text-neutral-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-all disabled:opacity-50"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </td>
                  </motion.tr>
                ))
              ) : (
                <tr>
                  <td colSpan={6} className="px-6 py-20 text-center text-neutral-500">
                    Tidak ada data pendaftaran yang ditemukan.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
