/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { collection, addDoc, serverTimestamp } from 'firebase/firestore';
import { db } from '../lib/firebase';
import { OperationType, handleFirestoreError } from '../lib/firestore-errors';
import { motion } from 'motion/react';
import { CheckCircle2, AlertCircle, Loader2, Send } from 'lucide-react';

const PRODI_OPTIONS = [
  "SISTEM INFORMASI",
  "TEKNIK INFORMATIKA",
  "TEKNOLOGI INFORMASI",
  "PENDIDIKAN MATEMATIKA",
  "BISNIS DIGITAL"
];

const formSchema = z.object({
  noPendaftaran: z.string()
    .min(1, "Nomor Pendaftaran wajib diisi")
    .regex(/^[0-9]{4}\.[0-9]{3}\.[0-9]{5}\.[0-9]{4}\.[0-9]{3}$/, "Format No. Pendaftaran tidak valid (Contoh: 1126.203.00715.1779.509)"),
  nim: z.string().min(1, "NIM wajib diisi"),
  nama: z.string().min(1, "Nama wajib diisi"),
  nik: z.string().length(16, "NIK harus 16 angka").regex(/^[0-9]+$/, "NIK harus berupa angka"),
  nisn: z.string().length(10, "NISN harus 10 angka").regex(/^[0-9]+$/, "NISN harus berupa angka"),
  npsn: z.string().length(8, "NPSN harus 8 angka").regex(/^[0-9]+$/, "NPSN harus berupa angka"),
  perguruanTinggi: z.string().min(1, "Perguruan Tinggi wajib diisi"),
  prodi: z.string().refine((val) => PRODI_OPTIONS.includes(val), {
    message: "Pilih Program Studi yang valid",
  }),
  email: z.string().email("Format email tidak valid"),
});

type FormData = z.infer<typeof formSchema>;

export default function RegistrationForm() {
  const [isSubmitting, setIsSubmitting] = React.useState(false);
  const [submitStatus, setSubmitStatus] = React.useState<'idle' | 'success' | 'error'>('idle');

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<FormData>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      perguruanTinggi: "UNIVERSITAS KOMPUTAMA",
      prodi: undefined,
    }
  });

  const onSubmit = async (data: FormData) => {
    setIsSubmitting(true);
    setSubmitStatus('idle');
    try {
      await addDoc(collection(db, 'registrations'), {
        ...data,
        createdAt: serverTimestamp(),
      });
      setSubmitStatus('success');
      reset();
    } catch (error) {
      setSubmitStatus('error');
      handleFirestoreError(error, OperationType.CREATE, 'registrations');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (submitStatus === 'success') {
    return (
      <motion.div 
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="max-w-2xl mx-auto bg-white p-12 rounded-2xl shadow-sm border border-neutral-200 text-center"
      >
        <div className="flex justify-center mb-6">
          <div className="bg-green-100 p-4 rounded-full">
            <CheckCircle2 className="w-12 h-12 text-green-600" />
          </div>
        </div>
        <h2 className="text-2xl font-bold text-neutral-900 mb-2">Pendaftaran Berhasil!</h2>
        <p className="text-neutral-600 mb-8">Data Anda telah berhasil tersimpan dalam sistem kami.</p>
        <button 
          onClick={() => setSubmitStatus('idle')}
          className="bg-blue-600 text-white px-6 py-2 rounded-lg font-medium hover:bg-blue-700 transition-colors"
        >
          Isi Form Lagi
        </button>
      </motion.div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto">
      <div className="text-center mb-10">
        <h1 className="text-3xl font-extrabold text-neutral-900 tracking-tight mb-2">Formulir Pendaftaran KIPK</h1>
        <p className="text-neutral-500">Silakan lengkapi data di bawah ini dengan benar dan teliti.</p>
      </div>

      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-white p-8 rounded-2xl shadow-sm border border-neutral-200"
      >
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-1.5">
              <label className="text-sm font-semibold text-neutral-700">Nomor Pendaftaran KIPK</label>
              <input 
                {...register('noPendaftaran')}
                className={`w-full px-4 py-2.5 bg-neutral-50 border rounded-lg focus:ring-2 focus:ring-blue-500 transition-all outline-none ${errors.noPendaftaran ? 'border-red-500' : 'border-neutral-200 hover:border-neutral-300'}`}
                placeholder="1126.203.00715.1779.509"
              />
              {errors.noPendaftaran && <p className="text-xs text-red-500 font-medium">{errors.noPendaftaran.message}</p>}
            </div>

            <div className="space-y-1.5">
              <label className="text-sm font-semibold text-neutral-700">NIM</label>
              <input 
                {...register('nim')}
                className={`w-full px-4 py-2.5 bg-neutral-50 border rounded-lg focus:ring-2 focus:ring-blue-500 transition-all outline-none ${errors.nim ? 'border-red-500' : 'border-neutral-200 hover:border-neutral-300'}`}
                placeholder="Nomor Induk Mahasiswa"
              />
              {errors.nim && <p className="text-xs text-red-500 font-medium">{errors.nim.message}</p>}
            </div>
          </div>

          <div className="space-y-1.5">
            <label className="text-sm font-semibold text-neutral-700">Nama Lengkap</label>
            <input 
              {...register('nama')}
              className={`w-full px-4 py-2.5 bg-neutral-50 border rounded-lg focus:ring-2 focus:ring-blue-500 transition-all outline-none ${errors.nama ? 'border-red-500' : 'border-neutral-200 hover:border-neutral-300'}`}
              placeholder="Sesuai KTP / Ijazah"
            />
            {errors.nama && <p className="text-xs text-red-500 font-medium">{errors.nama.message}</p>}
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="space-y-1.5">
              <label className="text-sm font-semibold text-neutral-700">NIK KTP (16 Angka)</label>
              <input 
                {...register('nik')}
                maxLength={16}
                className={`w-full px-4 py-2.5 bg-neutral-50 border rounded-lg focus:ring-2 focus:ring-blue-500 transition-all outline-none ${errors.nik ? 'border-red-500' : 'border-neutral-200 hover:border-neutral-300'}`}
                placeholder="16 digit angka"
              />
              {errors.nik && <p className="text-xs text-red-500 font-medium">{errors.nik.message}</p>}
            </div>

            <div className="space-y-1.5">
              <label className="text-sm font-semibold text-neutral-700">NISN (10 Angka)</label>
              <input 
                {...register('nisn')}
                maxLength={10}
                className={`w-full px-4 py-2.5 bg-neutral-50 border rounded-lg focus:ring-2 focus:ring-blue-500 transition-all outline-none ${errors.nisn ? 'border-red-500' : 'border-neutral-200 hover:border-neutral-300'}`}
                placeholder="10 digit angka"
              />
              {errors.nisn && <p className="text-xs text-red-500 font-medium">{errors.nisn.message}</p>}
            </div>

            <div className="space-y-1.5">
              <label className="text-sm font-semibold text-neutral-700">NPSN (8 Angka)</label>
              <input 
                {...register('npsn')}
                maxLength={8}
                className={`w-full px-4 py-2.5 bg-neutral-50 border rounded-lg focus:ring-2 focus:ring-blue-500 transition-all outline-none ${errors.npsn ? 'border-red-500' : 'border-neutral-200 hover:border-neutral-300'}`}
                placeholder="8 digit angka"
              />
              {errors.npsn && <p className="text-xs text-red-500 font-medium">{errors.npsn.message}</p>}
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-1.5">
              <label className="text-sm font-semibold text-neutral-700">Perguruan Tinggi</label>
              <input 
                {...register('perguruanTinggi')}
                readOnly
                className="w-full px-4 py-2.5 bg-neutral-100 border border-neutral-200 rounded-lg text-neutral-500 cursor-not-allowed outline-none"
              />
              {errors.perguruanTinggi && <p className="text-xs text-red-500 font-medium">{errors.perguruanTinggi.message}</p>}
            </div>

            <div className="space-y-1.5">
              <label className="text-sm font-semibold text-neutral-700">Program Studi</label>
              <select 
                {...register('prodi')}
                className={`w-full px-4 py-2.5 bg-neutral-50 border rounded-lg focus:ring-2 focus:ring-blue-500 transition-all outline-none appearance-none ${errors.prodi ? 'border-red-500' : 'border-neutral-200 hover:border-neutral-300'}`}
              >
                <option value="">Pilih Program Studi</option>
                {PRODI_OPTIONS.map(option => (
                  <option key={option} value={option}>{option}</option>
                ))}
              </select>
              {errors.prodi && <p className="text-xs text-red-500 font-medium">{errors.prodi.message}</p>}
            </div>
          </div>

          <div className="space-y-1.5">
            <label className="text-sm font-semibold text-neutral-700">Email Akun KIPK</label>
            <input 
              {...register('email')}
              type="email"
              className={`w-full px-4 py-2.5 bg-neutral-50 border rounded-lg focus:ring-2 focus:ring-blue-500 transition-all outline-none ${errors.email ? 'border-red-500' : 'border-neutral-200 hover:border-neutral-300'}`}
              placeholder="email@pendaftar.com"
            />
            {errors.email && <p className="text-xs text-red-500 font-medium">{errors.email.message}</p>}
          </div>

          <button 
            type="submit" 
            disabled={isSubmitting}
            className="w-full bg-blue-600 text-white py-3 rounded-xl font-bold flex items-center justify-center gap-2 hover:bg-blue-700 disabled:bg-neutral-300 disabled:cursor-not-allowed transition-all shadow-md shadow-blue-100"
          >
            {isSubmitting ? (
              <>
                <Loader2 className="w-5 h-5 animate-spin" />
                Memproses...
              </>
            ) : (
              <>
                <Send className="w-5 h-5" />
                Kirim Pendaftaran
              </>
            )}
          </button>

          {submitStatus === 'error' && (
            <div className="flex items-center gap-2 text-red-600 bg-red-50 p-3 rounded-lg border border-red-100">
              <AlertCircle className="w-5 h-5" />
              <p className="text-sm font-medium">Terjadi kesalahan. Silakan coba lagi.</p>
            </div>
          )}
        </form>
      </motion.div>
    </div>
  );
}
