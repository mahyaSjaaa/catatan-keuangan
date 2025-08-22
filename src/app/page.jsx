'use client'

import { useEffect, useState } from "react";
import { supabase } from "@/supa";
import { X, Plus, Edit3, DollarSign, TrendingUp, TrendingDown, Wallet } from "lucide-react";

export default function Home() {
  const [uang_masuk, setUangMasuk] = useState(0)
  const [uang_keluae, setUangKeluar] = useState(0)
  const [pemasukan, setPemasukan] = useState(0)
  const [pengeluaran, setPengeluaran] = useState(0)

  const [uang_masukEdit, setUangMasukEdit] = useState(0)
  const [uang_keluaeEdit, setUangKeluarEdit] = useState(0)
  const [pemasukanEdit, setPemasukanEdit] = useState(0)
  const [pengeluaranEdit, setPengeluaranEdit] = useState(0)

  const [uang_masukToday, setUangMasukToday] = useState(0)
  const [uang_keluaeToday, setUangKeluarToday] = useState(0)
  const [pemasukanToday, setPemasukanToday] = useState(0)
  const [pengeluaranToday, setPengeluaranToday] = useState(0)
  const [datas, setDatas] = useState([])
  const [keterangan, setKeterangan] = useState('')
  const [metode, setMetode] = useState('cash')
  const [onEdit, setOnEdit] = useState(false)
  const [id, setId] = useState('')
  const [mode, setMode] = useState('pengeluaran')

  const [pemasukanAll, setPemasukanAll] = useState(0)
  const [pengeluaranAll,setPengeluaranAll] = useState(0)
  const [uang_masukAll, setUang_masukAll] = useState(0)
  const [uang_keluarALl, setUang_KeluarAll] = useState(0)

  const [tanggalGte, setTanggalGte] = useState('')
  const [tanggalLte, setTanggalLte] = useState('')
  const [onClear, setOnClear] = useState(0)

  const [wallet, setWallet] = useState([])

    const fetchTransaksiByDate = async () => {
      const { data } = await supabase
      .from('expensess')
      .select()
      .gte('created_at', `${tanggalGte}T00:00:00`)
      .lte('created_at', `${tanggalLte}T23:59:59`).order('created_at', {ascending:false})
      console.log(data);
      
      if (data) {
          setDatas(data);
          const cashIn = data.reduce((a, b) => a + b.uang_masuk, 0)
          const cashOut = data.reduce((a, b) => a+ b.uang_keluar, 0)
          const revenue = data.reduce((a, b) => a+ b.pemasukan, 0)
          const expens = data.reduce((a, b) => a+ b.pengeluaran, 0)
          setUangMasukToday(cashIn)
          setUangKeluarToday(cashOut)
          setPemasukanToday(revenue)
          setPengeluaranToday(expens)
      } 
    }

  const handlePengeluaran = async () => {
    const {error} = await supabase.from('expensess').insert({
      uang_keluar: uang_keluae,
      pengeluaran: pengeluaran,
      keterangan: keterangan,
      metode: metode,
      status: "PENGELUARAN"
    })
    console.log(error); 
    const now = new Date();
    const todayStart = new Date(now.toLocaleString("en-US", { timeZone: "Asia/Jakarta" }));
    todayStart.setHours(0,0,0,0);
    const todayEnd = new Date(todayStart);
    todayEnd.setHours(23,59,59,999);

    const startISO = todayStart.toISOString();
    const endISO = todayEnd.toISOString();
    
    
    if(error) return
    const sisahUang = wallet - pengeluaran
    
    const {err:errUpdtWallet} = await supabase.from('wallet').update({
      nominal: sisahUang
    }).eq('id', 2)
    console.log(errUpdtWallet);
    
    const {data:cekData, error:errCheck} = await supabase.from('recap').select().gte('created_at', startISO).lte('created_at', endISO)
    console.log(cekData);
    
    if(cekData.length === 0){
      const {error} = await supabase.from('recap').insert({
        uang_masuk: uang_masuk,
        pemasukan: pemasukan,
        uang_keluar: uang_keluae,
        pengeluaran: pengeluaran,
      })
      console.log(error);
    }else{
      const pengeluaranBefore = cekData[0]?.pengeluaran
      const day = cekData[0]?.created_at
      const uang_keluarBefore = cekData[0]?.uang_keluar

      const {error} = await supabase.from('recap').update({
        uang_keluar: parseInt(uang_keluae) + parseInt(uang_keluarBefore),
        pengeluaran: parseInt(pengeluaran) + parseInt(pengeluaranBefore),
      }).eq('created_at', day)
      console.log(error);
      
    }
  }

  const handlePemasukan = async () => {
    const {error} = await supabase.from('expensess').insert({
      uang_masuk: uang_masuk,
      pemasukan: pemasukan,
      keterangan: keterangan,
      metode: metode,
      status: "PEMASUKAN"
    })
    console.log(error); 
    const now = new Date();
    const todayStart = new Date(now.toLocaleString("en-US", { timeZone: "Asia/Jakarta" }));
    todayStart.setHours(0,0,0,0);
    const todayEnd = new Date(todayStart);
    todayEnd.setHours(23,59,59,999);

    const startISO = todayStart.toISOString();
    const endISO = todayEnd.toISOString();
    
    
    if(error) return
    const {data:cekData, error:errCheck} = await supabase.from('recap').select().gte('created_at', startISO).lte('created_at', endISO)
    const {data:cekWaller, error:errCheckWallet} = await supabase.from('wallet').select()
    console.log(cekData);
    
    if(cekWaller.length === 0){
      const {error} = await supabase.from('wallet').insert({
        nominal: pemasukan,
      })
      console.log(error);
    }else{
      const {error} = await supabase.from('wallet').update({
        nominal: parseInt(wallet) + parseInt(pemasukan),
      }).eq('id', 2)
      console.log(error);
    }    

    if(cekData.length === 0){
      const {error} = await supabase.from('recap').insert({
        uang_masuk: uang_masuk,
        pemasukan: pemasukan,
        uang_keluar: uang_keluae,
        pengeluaran: pengeluaran,
      })
      console.log(error);
    }else{
      const pemasukanBefore = cekData[0]?.pemasukan
      const day = cekData[0]?.created_at
      const uang_masukBefore = cekData[0]?.uang_masuk

      const {error} = await supabase.from('recap').update({
        uang_masuk: parseInt(uang_masuk) + parseInt(uang_masukBefore),
        pemasukan: parseInt(pemasukan) + parseInt(pemasukanBefore),
      }).eq('created_at', day)
      console.log(error); 
    }
  }

  useEffect(() => {
    const fetchData = async () => {
      const now = new Date();
      const todayStart = new Date(now.toLocaleString("en-US", { timeZone: "Asia/Jakarta" }));
      todayStart.setHours(0,0,0,0);
      const todayEnd = new Date(todayStart);
      todayEnd.setHours(23,59,59,999);

      const startISO = todayStart.toISOString();
      const endISO = todayEnd.toISOString();
      
      const {data, error} = await supabase.from('expensess').select().gte('created_at', startISO).lte('created_at', endISO).order('created_at', {ascending:false})
      const {data:all, error:errAll} = await supabase.from('recap').select()
      const {data:wallet, error:errWallet} = await supabase.from('wallet').select()
      console.log(data);
      console.log(all);
      
      
      setDatas(data)
      setWallet(wallet[0]?.nominal)
      setPemasukanAll(all[0]?.pemasukan)
      setPengeluaranAll(all[0]?.pengeluaran)
      setUang_masukAll(all[0]?.uang_masuk)
      setUang_KeluarAll(all[0]?.uang_keluar)
      const cashIn = data.reduce((a, b) => a + b.uang_masuk, 0)
      const cashOut = data.reduce((a, b) => a+ b.uang_keluar, 0)
      const revenue = data.reduce((a, b) => a+ b.pemasukan, 0)
      const expens = data.reduce((a, b) => a+ b.pengeluaran, 0)
      setUangMasukToday(cashIn)
      setUangKeluarToday(cashOut)
      setPemasukanToday(revenue)
      setPengeluaranToday(expens)
    }
    fetchData()
  }, [onClear])

    useEffect(() => {
        if(tanggalGte != "" && tanggalLte != "")fetchTransaksiByDate()
    },[tanggalGte, tanggalLte ])

  const fetchEdit = async (id) => {
    if (!id && onEdit === false) {
      setId('')
      return
    }
    const {data, error} = await supabase.from('expensess').select().eq('id', id)
    setPemasukanEdit(data[0]?.pemasukan)
    setPengeluaranEdit(data[0]?.pengeluaran)
    setKeterangan(data[0]?.keterangan)
    setMetode(data[0]?.metode)
    setUangKeluarEdit(data[0]?.uang_keluar)
    setUangMasukEdit(data[0]?.uang_masuk)
    setId(data[0]?.id)
  }

  const handlePengeluaranEdit = async () => {
    const {error} = await supabase.from('expensess').update({
      uang_keluar: uang_keluae,
      pengeluaran: pengeluaran,
      keterangan: keterangan,
      metode: metode
    }).eq('id', id)
    console.log(error);
    
  }

  const handlePemasukanEdit = async () => {
    const {error} = await supabase.from('expensess').update({
      uang_masuk: uang_masuk,
      pemasukan: pemasukan,
      keterangan: keterangan,
      metode: metode
    }).eq('id', id)
    console.log(error);
    
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50">
      <div className="container mx-auto px-4 py-6 max-w-6xl">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Expense Tracker</h1>
          <p className="text-gray-600">Kelola keuangan Anda dengan mudah</p>
        </div>

          <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-4 mb-4">
            <div className="flex items-center justify-between mb-2">
              <div className="w-10 h-10 bg-yellow-100 rounded-lg flex items-center justify-center">
                <Wallet className="w-5 h-5 text-yellow-600" />
              </div>
            </div>
            <p className="text-sm text-gray-600 mb-1">Uang Tersisah</p>
            <p className="text-lg font-semibold text-gray-900">{wallet.toLocaleString("id-ID", {
              style: "currency",
              currency: "IDR",
            })}</p>
          </div>
          

        {/* Summary Cards */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
          <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-4">
            <div className="flex items-center justify-between mb-2">
              <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center">
                <TrendingUp className="w-5 h-5 text-green-600" />
              </div>
            </div>
            <p className="text-sm text-gray-600 mb-1">{tanggalGte === '' && tanggalLte === '' ? 'Uang Masuk Hari Ini' : `Uang Masuk dari ${tanggalGte} Hingga ${tanggalLte}`}</p>
            <p className="text-lg font-semibold text-gray-900">{uang_masukToday.toLocaleString("id-ID", {
              style: "currency",
              currency: "IDR",
            })}</p>
          </div>
          
          <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-4">
            <div className="flex items-center justify-between mb-2">
              <div className="w-10 h-10 bg-red-100 rounded-lg flex items-center justify-center">
                <TrendingDown className="w-5 h-5 text-red-600" />
              </div>
            </div>
            <p className="text-sm text-gray-600 mb-1">{tanggalGte === '' && tanggalLte === '' ? 'Uang Keluar Hari Ini' : `Uang Keluar dari ${tanggalGte} Hingga ${tanggalLte}`}</p>
            <p className="text-lg font-semibold text-gray-900">{uang_keluaeToday.toLocaleString("id-ID", {
              style: "currency",
              currency: "IDR",
            })}</p>
          </div>
          
          <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-4">
            <div className="flex items-center justify-between mb-2">
              <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                <DollarSign className="w-5 h-5 text-blue-600" />
              </div>
            </div>
            <p className="text-sm text-gray-600 mb-1">{tanggalGte === '' && tanggalLte === '' ? 'Pemasukan Hari Ini' : `Pemasukan dari ${tanggalGte} Hingga ${tanggalLte}`}</p>
            <p className="text-lg font-semibold text-gray-900">{pemasukanToday.toLocaleString("id-ID", {
              style: "currency",
              currency: "IDR",
            })}</p>
          </div>
          
          <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-4">
            <div className="flex items-center justify-between mb-2">
              <div className="w-10 h-10 bg-yellow-100 rounded-lg flex items-center justify-center">
                <Wallet className="w-5 h-5 text-yellow-600" />
              </div>
            </div>
            <p className="text-sm text-gray-600 mb-1">{tanggalGte === '' && tanggalLte === '' ? 'Pengeluaran Hari Ini' : `Pengeluaran dari ${tanggalGte} Hingga ${tanggalLte}`}</p>
            <p className="text-lg font-semibold text-gray-900">{pengeluaranToday.toLocaleString("id-ID", {
                  style: "currency",
                  currency: "IDR",
                })}</p>
          </div>
        </div>

        <div className="grid lg:grid-cols-2 gap-8">
          {/* Input Form */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
            <h2 className="text-xl font-semibold text-gray-900 mb-6">Tambah Transaksi</h2>
            
            <div className="mb-6">
              <label className="block text-sm font-medium text-gray-700 mb-3">Tipe Transaksi</label>
              <div className="grid grid-cols-2 gap-2">
                <button
                  onClick={() => {
                    setMode('pengeluaran')
                    setPemasukanEdit(0)
                    setPengeluaranEdit(0)
                    setKeterangan('')
                    setMetode('cash')
                    setUangKeluarEdit(0)
                    setUangMasukEdit(0)
                    setOnEdit(false)
                  }}
                  className={`py-3 px-4 rounded-lg font-medium transition-all ${
                    mode === 'pengeluaran' 
                      ? 'bg-red-600 text-white shadow-lg shadow-red-200' 
                      : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                  }`}
                >
                  Pengeluaran
                </button>
                <button
                  onClick={() => {
                    setMode('pemasukan')
                    setPemasukanEdit(0)
                    setPengeluaranEdit(0)
                    setKeterangan('')
                    setMetode('cash')
                    setUangKeluarEdit(0)
                    setUangMasukEdit(0)
                    setOnEdit(false)
                  }}
                  className={`py-3 px-4 rounded-lg font-medium transition-all ${
                    mode === 'pemasukan' 
                      ? 'bg-green-600 text-white shadow-lg shadow-green-200' 
                      : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                  }`}
                >
                  Pemasukan
                </button>
              </div>
            </div>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  {mode === "pengeluaran" ? 'Uang Keluar' : 'Uang Masuk'}
                </label>
                <input 
                  type="number" 
                  value={mode === "pengeluaran" ? uang_keluae : uang_masuk} 
                  onChange={(e) => mode === "pengeluaran" ? setUangKeluar(e.target.value) : setUangMasuk(e.target.value)} 
                  className="w-full px-4 py-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                  placeholder="0"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  {mode === "pengeluaran" ? 'Pengeluaran' : 'Pemasukan'}
                </label>
                <input 
                  type="number" 
                  value={mode === "pengeluaran" ? pengeluaran : pemasukan} 
                  onChange={(e) => mode === "pengeluaran" ? setPengeluaran(e.target.value) : setPemasukan(e.target.value)} 
                  className="w-full px-4 py-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                  placeholder="0"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Keterangan</label>
                <input 
                  type="text" 
                  value={keterangan} 
                  onChange={(e) => setKeterangan(e.target.value)} 
                  className="w-full px-4 py-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                  placeholder="Deskripsi transaksi"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Metode</label>
                <select 
                  value={metode} 
                  onChange={(e) => setMetode(e.target.value)} 
                  className="w-full px-4 py-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all bg-white"
                >
                  <option value="cash">Cash</option>
                  <option value="bank">BNI</option>
                </select>
              </div>

              <button 
                onClick={mode === "pengeluaran" ? handlePengeluaran : handlePemasukan}
                className={`w-full py-3 px-4 rounded-lg font-medium text-white transition-all flex items-center justify-center gap-2 ${
                  mode === "pengeluaran" 
                    ? 'bg-red-600 hover:bg-red-700 shadow-lg shadow-red-200' 
                    : 'bg-green-600 hover:bg-green-700 shadow-lg shadow-green-200'
                }`}
              >
                <Plus className="w-5 h-5" />
                Simpan
              </button>
            </div>
          </div>

          {/* Transaction List */}
          <div className="bg-white rounded-xl shadow-sm border p-6 border-gray-100">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-semibold text-gray-900">Riwayat Transaksi</h2>
            </div>
            <div className="flex flex-wrap justify-between items-center mb-8">
              <p className="text-gray-500 text-[15px]">Dari:</p>
              <input
                type="date"
                value={tanggalGte}
                onChange={(e) => setTanggalGte(e.target.value)}
                className="border border-gray-400 rounded-sm px-2 py-1 md:w-full sm:w-full text-sm outline-none w-full sm:w-auto"
              />

              <p className="text-gray-500 text-[15px]">Hingga:</p>
              <input
                type="date"
                value={tanggalLte}
                onChange={(e) => setTanggalLte(e.target.value)}
                className="border border-gray-400 rounded-sm px-2 py-1 md:w-full sm:w-full text-sm outline-none w-full sm:w-auto"
              />

              <button
                className={`${tanggalGte == "" || tanggalLte == "" 
                  ? 'bg-gray-100 text-gray-400' 
                  : 'bg-[#4170FF] text-white'} 
                  w-full mt-5 lg:w-20 md:w-full md:mt-5 sm:w-full sm:mt-5 py-1 rounded-sm`}
                disabled={tanggalGte == "" || tanggalLte == ""}
                onClick={() => {
                  setTanggalGte('')
                  setTanggalLte('')
                  setOnClear((prev) => prev + 1)
                }}
              >
                Clear
              </button>
            </div>

              <div className="space-y-3 max-h-96 overflow-y-auto">
                {mode === "pengeluaran" ? (
                  datas?.filter(data => data.status === "PENGELUARAN").length > 0 ? (
                    datas?.filter(data => data.status === "PENGELUARAN").map((data) => (
                      <div key={data.id} className="bg-red-50 border border-red-200 rounded-lg p-4">
                        <div className="flex items-start justify-between">
                          <div className="flex-1">
                            <div className="flex items-center gap-2 mb-2">
                              <div className="w-8 h-8 bg-red-100 rounded-full flex items-center justify-center">
                                <TrendingDown className="w-4 h-4 text-red-600" />
                              </div>
                              <span className="font-medium text-gray-900">{data.keterangan || 'Tanpa keterangan'}</span>
                            </div>
                            <p className="text-[14px]">Tanggal: {new Date(data.created_at).toLocaleString('id-ID', {
                                timeZone: "Asia/Jakarta", 
                                year: "numeric", 
                                month: "2-digit", 
                                day: "2-digit", 
                                hour: "2-digit", 
                                minute: "2-digit" 
                            })}</p>
                            <div className="grid grid-cols-2 gap-2 text-sm">
                              <p><span className="text-gray-600">Pengeluaran:</span> <span className="font-medium">{data.pengeluaran.toLocaleString("id-ID", {
                                style: "currency",
                                currency: "IDR",
                              })}</span></p>
                              <p><span className="text-gray-600">Uang Keluar:</span> <span className="font-medium">{data.uang_keluar.toLocaleString("id-ID", {
                                style: "currency",
                                currency: "IDR",
                              })}</span></p>
                              <p><span className="text-gray-600">Metode:</span> <span className="font-medium capitalize">{data.metode}</span></p>
                            </div>
                          </div>
                          <button 
                            onClick={() => {
                              setOnEdit(true)
                              fetchEdit(data.id)
                            }}
                            className="ml-3 w-8 h-8 bg-gray-100 hover:bg-gray-200 rounded-lg flex items-center justify-center transition-colors"
                          >
                            <Edit3 className="w-4 h-4 text-gray-600" />
                          </button>
                        </div>
                      </div>
                    ))
                  ) : (
                    <div className="text-center py-8 text-gray-500">
                      <p>Belum ada data pengeluaran hari ini</p>
                    </div>
                  )
                ) : (
                  datas?.filter(data => data.status === "PEMASUKAN").length > 0 ? (
                    datas?.filter(data => data.status === "PEMASUKAN").map((data) => (
                      <div key={data.id} className="bg-green-50 border border-green-200 rounded-lg p-4">
                        <div className="flex items-start justify-between">
                          <div className="flex-1">
                            <div className="flex items-center gap-2 mb-2">
                              <div className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center">
                                <TrendingUp className="w-4 h-4 text-green-600" />
                              </div>
                              <span className="font-medium text-gray-900">{data.keterangan || 'Tanpa keterangan'}</span>
                            </div>
                            <p className="text-[14px]">Tanggal: {new Date(data.created_at).toLocaleString('id-ID', {
                                timeZone: "Asia/Jakarta", 
                                year: "numeric", 
                                month: "2-digit", 
                                day: "2-digit", 
                                hour: "2-digit", 
                                minute: "2-digit" 
                            })}</p>
                            <div className="grid grid-cols-2 gap-2 text-sm">
                              <p><span className="text-gray-600">Pemasukan:</span> <span className="font-medium">{data.pemasukan.toLocaleString("id-ID", {
                                style: "currency",
                                currency: "IDR",
                              })}</span></p>
                              <p><span className="text-gray-600">Uang Masuk:</span> <span className="font-medium">{data.uang_masuk.toLocaleString("id-ID", {
                                style: "currency",
                                currency: "IDR",
                              })}</span></p>
                              <p><span className="text-gray-600">Metode:</span> <span className="font-medium capitalize">{data.metode}</span></p>
                            </div>
                          </div>
                          <button 
                            onClick={() => {
                              setOnEdit(true)
                              fetchEdit(data.id)
                            }}
                            className="ml-3 w-8 h-8 bg-gray-100 hover:bg-gray-200 rounded-lg flex items-center justify-center transition-colors"
                          >
                            <Edit3 className="w-4 h-4 text-gray-600" />
                          </button>
                        </div>
                      </div>
                    ))
                  ) : (
                    <div className="text-center py-8 text-gray-500">
                      <p>Belum ada data pemasukan hari ini</p>
                    </div>
                  )
                )}
              </div>
          </div>
        </div>
      </div>

      {/* Edit Modal */}
      {onEdit && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-xl shadow-xl max-w-md w-full max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between p-6 border-b border-gray-200">
              <h3 className="text-lg font-semibold text-gray-900">
                Edit {mode === "pengeluaran" ? 'Pengeluaran' : 'Pemasukan'}
              </h3>
              <button 
                onClick={() => {
                  setOnEdit(false)
                  setPemasukanEdit(0)
                  setPengeluaranEdit(0)
                  setKeterangan('')
                  setMetode('cash')
                  setUangKeluarEdit(0)
                  setUangMasukEdit(0)
                }}
                className="w-8 h-8 bg-gray-100 hover:bg-gray-200 rounded-lg flex items-center justify-center transition-colors"
              >
                <X className="w-4 h-4 text-gray-600" />
              </button>
            </div>
            
            <div className="p-6">
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    {mode === "pengeluaran" ? 'Uang Keluar' : 'Uang Masuk'}
                  </label>
                  <input 
                    type="number" 
                    value={mode === "pengeluaran" ? uang_keluaeEdit : uang_masukEdit} 
                    onChange={(e) => mode === "pengeluaran" ? setUangKeluarEdit(e.target.value) : setUangMasukEdit(e.target.value)} 
                    className="w-full px-4 py-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                    placeholder="0"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    {mode === "pengeluaran" ? 'Pengeluaran' : 'Pemasukan'}
                  </label>
                  <input 
                    type="number" 
                    value={mode === "pengeluaran" ? pengeluaranEdit : pemasukanEdit} 
                    onChange={(e) => mode === "pengeluaran" ? setPengeluaranEdit(e.target.value) : setPemasukanEdit(e.target.value)} 
                    className="w-full px-4 py-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                    placeholder="0"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Keterangan</label>
                  <input 
                    type="text" 
                    value={keterangan} 
                    onChange={(e) => setKeterangan(e.target.value)} 
                    className="w-full px-4 py-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                    placeholder="Deskripsi transaksi"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Metode</label>
                  <select 
                    value={metode} 
                    onChange={(e) => setMetode(e.target.value)} 
                    className="w-full px-4 py-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all bg-white"
                  >
                    <option value="cash">Cash</option>
                    <option value="bank">BNI</option>
                  </select>
                </div>

                <button 
                  onClick={mode === "pengeluaran" ? handlePengeluaranEdit : handlePemasukanEdit}
                  className={`w-full py-3 px-4 rounded-lg font-medium text-white transition-all ${
                    mode === "pengeluaran" 
                      ? 'bg-red-600 hover:bg-red-700' 
                      : 'bg-green-600 hover:bg-green-700'
                  }`}
                >
                  Simpan Perubahan
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
