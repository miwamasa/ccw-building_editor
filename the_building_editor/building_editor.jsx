import React, { useState } from 'react';
import { Building, Layers, Wind, Thermometer, Zap, Plus, Trash2, Save, Upload, Download, Eye, EyeOff } from 'lucide-react';

const BuildingDataEditor = () => {
  const [buildingData, setBuildingData] = useState({
    building: {
      id: 'Building_A',
      name: '',
      location: '',
      totalArea: 0
    },
    floors: [],
    largeZones: [],
    smallZones: [],
    rooms: [],
    centralHVAC: {
      chillers: [],
      ahus: [],
      vavs: []
    },
    individualHVAC: {
      vrfs: []
    },
    sensors: []
  });

  const [activeTab, setActiveTab] = useState('building');
  const [showJson, setShowJson] = useState(false);

  // サンプルデータのロード
  const loadSampleData = () => {
    const sample = {
      building: {
        id: 'Building_A',
        name: '東京グリーンタワー',
        location: '東京都千代田区',
        totalArea: 2400
      },
      floors: [
        { id: 'Floor_1', name: '1階', area: 1200 },
        { id: 'Floor_2', name: '2階', area: 1200 }
      ],
      largeZones: [
        { id: 'LargeZone_1A', name: '大ゾーン1A(東側エリア)', floorId: 'Floor_1', ahuId: 'AHU_1' },
        { id: 'LargeZone_1B', name: '大ゾーン1B(西側エリア)', floorId: 'Floor_1', ahuId: 'AHU_1' },
        { id: 'LargeZone_2A', name: '大ゾーン2A(全フロア)', floorId: 'Floor_2', ahuId: 'AHU_2' }
      ],
      smallZones: [
        { id: 'SmallZone_1A1', name: '小ゾーン1A1(会議室エリア)', largeZoneId: 'LargeZone_1A', vrfId: 'VRF_Unit_1' },
        { id: 'SmallZone_1A2', name: '小ゾーン1A2(オフィスエリア)', largeZoneId: 'LargeZone_1A', vrfId: 'VRF_Unit_1' },
        { id: 'SmallZone_1A3', name: '小ゾーン1A3(サーバールーム)', largeZoneId: 'LargeZone_1A', vrfId: 'VRF_Unit_2' },
        { id: 'SmallZone_1B1', name: '小ゾーン1B1(執務室エリア)', largeZoneId: 'LargeZone_1B', vrfId: 'VRF_Unit_1' },
        { id: 'SmallZone_1B2', name: '小ゾーン1B2(休憩室)', largeZoneId: 'LargeZone_1B', vrfId: 'VRF_Unit_2' },
        { id: 'SmallZone_2A1', name: '小ゾーン2A1(役員室エリア)', largeZoneId: 'LargeZone_2A', vrfId: 'VRF_Unit_3' },
        { id: 'SmallZone_2A2', name: '小ゾーン2A2(オープンオフィス)', largeZoneId: 'LargeZone_2A', vrfId: 'VRF_Unit_3' }
      ],
      rooms: [
        { id: 'Room_101', name: '会議室101', smallZoneId: 'SmallZone_1A1', area: 30 },
        { id: 'Room_102', name: '会議室102', smallZoneId: 'SmallZone_1A1', area: 30 },
        { id: 'Room_103', name: 'オフィス103', smallZoneId: 'SmallZone_1A2', area: 50 },
        { id: 'Room_104', name: 'オフィス104', smallZoneId: 'SmallZone_1A2', area: 50 },
        { id: 'Room_105', name: 'サーバールーム105', smallZoneId: 'SmallZone_1A3', area: 40 },
        { id: 'Room_106', name: '執務室106', smallZoneId: 'SmallZone_1B1', area: 80 },
        { id: 'Room_107', name: '休憩室107', smallZoneId: 'SmallZone_1B2', area: 30 },
        { id: 'Room_201', name: '役員室201', smallZoneId: 'SmallZone_2A1', area: 60 },
        { id: 'Room_202', name: 'オープンオフィス202', smallZoneId: 'SmallZone_2A2', area: 200 }
      ],
      centralHVAC: {
        chillers: [
          { id: 'Chiller_1', name: 'チラー1号機', capacity: 150, powerRating: 50 }
        ],
        ahus: [
          { id: 'AHU_1', name: '外調機1号機(1階担当)', chillerId: 'Chiller_1', airflow: 10000 },
          { id: 'AHU_2', name: '外調機2号機(2階担当)', chillerId: 'Chiller_1', airflow: 8000 }
        ],
        vavs: [
          { id: 'VAV_1A1', name: 'VAV 1A-1', ahuId: 'AHU_1', largeZoneId: 'LargeZone_1A' },
          { id: 'VAV_1A2', name: 'VAV 1A-2', ahuId: 'AHU_1', largeZoneId: 'LargeZone_1A' },
          { id: 'VAV_1B1', name: 'VAV 1B-1', ahuId: 'AHU_1', largeZoneId: 'LargeZone_1B' },
          { id: 'VAV_2A1', name: 'VAV 2A-1', ahuId: 'AHU_2', largeZoneId: 'LargeZone_2A' }
        ]
      },
      individualHVAC: {
        vrfs: [
          { id: 'VRF_Unit_1', name: 'VRF室外機1号機', capacity: 40, powerRating: 15 },
          { id: 'VRF_Unit_2', name: 'VRF室外機2号機', capacity: 30, powerRating: 12 },
          { id: 'VRF_Unit_3', name: 'VRF室外機3号機', capacity: 35, powerRating: 13 }
        ]
      },
      sensors: [
        { id: 'AHU1_Outside_Air_Temp', name: '外調機1_外気温度センサー', type: 'temperature', equipmentId: 'AHU_1', unit: '°C' },
        { id: 'AHU1_Supply_Air_Temp', name: '外調機1_給気温度センサー', type: 'temperature', equipmentId: 'AHU_1', unit: '°C' },
        { id: 'AHU1_Return_Air_Temp', name: '外調機1_還気温度センサー', type: 'temperature', equipmentId: 'AHU_1', unit: '°C' },
        { id: 'AHU1_Return_Air_Humidity', name: '外調機1_還気湿度センサー', type: 'humidity', equipmentId: 'AHU_1', unit: '%' },
        { id: 'Chiller1_Power', name: 'チラー1_電力センサー', type: 'power', equipmentId: 'Chiller_1', unit: 'kW' },
        { id: 'VRF1_Power', name: 'VRF1_電力センサー', type: 'power', equipmentId: 'VRF_Unit_1', unit: 'kW' },
        { id: 'Room_101_Temp', name: '会議室101_室温センサー', type: 'temperature', equipmentId: 'Room_101', unit: '°C' }
      ]
    };
    setBuildingData(sample);
  };

  // JSON エクスポート
  const exportToJSON = () => {
    const dataStr = JSON.stringify(buildingData, null, 2);
    const dataBlob = new Blob([dataStr], { type: 'application/json' });
    const url = URL.createObjectURL(dataBlob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `building_data_${buildingData.building.id}.json`;
    link.click();
    URL.revokeObjectURL(url);
  };

  // JSON インポート
  const importFromJSON = (event) => {
    const file = event.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (e) => {
        try {
          const data = JSON.parse(e.target.result);
          setBuildingData(data);
          alert('データを読み込みました');
        } catch (error) {
          alert('JSONの読み込みに失敗しました: ' + error.message);
        }
      };
      reader.readAsText(file);
    }
  };

  // 建物情報の更新
  const updateBuilding = (field, value) => {
    setBuildingData(prev => ({
      ...prev,
      building: { ...prev.building, [field]: value }
    }));
  };

  // 階の追加
  const addFloor = () => {
    const newFloor = {
      id: `Floor_${buildingData.floors.length + 1}`,
      name: `${buildingData.floors.length + 1}階`,
      area: 0
    };
    setBuildingData(prev => ({
      ...prev,
      floors: [...prev.floors, newFloor]
    }));
  };

  // 階の削除
  const deleteFloor = (id) => {
    setBuildingData(prev => ({
      ...prev,
      floors: prev.floors.filter(f => f.id !== id)
    }));
  };

  // 階の更新
  const updateFloor = (id, field, value) => {
    setBuildingData(prev => ({
      ...prev,
      floors: prev.floors.map(f => f.id === id ? { ...f, [field]: value } : f)
    }));
  };

  // 大ゾーンの追加
  const addLargeZone = () => {
    const newZone = {
      id: `LargeZone_${buildingData.largeZones.length + 1}`,
      name: '',
      floorId: buildingData.floors[0]?.id || '',
      ahuId: ''
    };
    setBuildingData(prev => ({
      ...prev,
      largeZones: [...prev.largeZones, newZone]
    }));
  };

  // 大ゾーンの削除
  const deleteLargeZone = (id) => {
    setBuildingData(prev => ({
      ...prev,
      largeZones: prev.largeZones.filter(z => z.id !== id)
    }));
  };

  // 大ゾーンの更新
  const updateLargeZone = (id, field, value) => {
    setBuildingData(prev => ({
      ...prev,
      largeZones: prev.largeZones.map(z => z.id === id ? { ...z, [field]: value } : z)
    }));
  };

  // 小ゾーンの追加
  const addSmallZone = () => {
    const newZone = {
      id: `SmallZone_${buildingData.smallZones.length + 1}`,
      name: '',
      largeZoneId: buildingData.largeZones[0]?.id || '',
      vrfId: ''
    };
    setBuildingData(prev => ({
      ...prev,
      smallZones: [...prev.smallZones, newZone]
    }));
  };

  // 小ゾーンの削除
  const deleteSmallZone = (id) => {
    setBuildingData(prev => ({
      ...prev,
      smallZones: prev.smallZones.filter(z => z.id !== id)
    }));
  };

  // 小ゾーンの更新
  const updateSmallZone = (id, field, value) => {
    setBuildingData(prev => ({
      ...prev,
      smallZones: prev.smallZones.map(z => z.id === id ? { ...z, [field]: value } : z)
    }));
  };

  // 部屋の追加
  const addRoom = () => {
    const newRoom = {
      id: `Room_${buildingData.rooms.length + 1}`,
      name: '',
      smallZoneId: buildingData.smallZones[0]?.id || '',
      area: 0
    };
    setBuildingData(prev => ({
      ...prev,
      rooms: [...prev.rooms, newRoom]
    }));
  };

  // 部屋の削除
  const deleteRoom = (id) => {
    setBuildingData(prev => ({
      ...prev,
      rooms: prev.rooms.filter(r => r.id !== id)
    }));
  };

  // 部屋の更新
  const updateRoom = (id, field, value) => {
    setBuildingData(prev => ({
      ...prev,
      rooms: prev.rooms.map(r => r.id === id ? { ...r, [field]: value } : r)
    }));
  };

  // チラーの追加
  const addChiller = () => {
    const newChiller = {
      id: `Chiller_${buildingData.centralHVAC.chillers.length + 1}`,
      name: '',
      capacity: 0,
      powerRating: 0
    };
    setBuildingData(prev => ({
      ...prev,
      centralHVAC: {
        ...prev.centralHVAC,
        chillers: [...prev.centralHVAC.chillers, newChiller]
      }
    }));
  };

  // チラーの削除
  const deleteChiller = (id) => {
    setBuildingData(prev => ({
      ...prev,
      centralHVAC: {
        ...prev.centralHVAC,
        chillers: prev.centralHVAC.chillers.filter(c => c.id !== id)
      }
    }));
  };

  // チラーの更新
  const updateChiller = (id, field, value) => {
    setBuildingData(prev => ({
      ...prev,
      centralHVAC: {
        ...prev.centralHVAC,
        chillers: prev.centralHVAC.chillers.map(c => c.id === id ? { ...c, [field]: value } : c)
      }
    }));
  };

  // AHUの追加
  const addAHU = () => {
    const newAHU = {
      id: `AHU_${buildingData.centralHVAC.ahus.length + 1}`,
      name: '',
      chillerId: buildingData.centralHVAC.chillers[0]?.id || '',
      airflow: 0
    };
    setBuildingData(prev => ({
      ...prev,
      centralHVAC: {
        ...prev.centralHVAC,
        ahus: [...prev.centralHVAC.ahus, newAHU]
      }
    }));
  };

  // AHUの削除
  const deleteAHU = (id) => {
    setBuildingData(prev => ({
      ...prev,
      centralHVAC: {
        ...prev.centralHVAC,
        ahus: prev.centralHVAC.ahus.filter(a => a.id !== id)
      }
    }));
  };

  // AHUの更新
  const updateAHU = (id, field, value) => {
    setBuildingData(prev => ({
      ...prev,
      centralHVAC: {
        ...prev.centralHVAC,
        ahus: prev.centralHVAC.ahus.map(a => a.id === id ? { ...a, [field]: value } : a)
      }
    }));
  };

  // VAVの追加
  const addVAV = () => {
    const newVAV = {
      id: `VAV_${buildingData.centralHVAC.vavs.length + 1}`,
      name: '',
      ahuId: buildingData.centralHVAC.ahus[0]?.id || '',
      largeZoneId: buildingData.largeZones[0]?.id || ''
    };
    setBuildingData(prev => ({
      ...prev,
      centralHVAC: {
        ...prev.centralHVAC,
        vavs: [...prev.centralHVAC.vavs, newVAV]
      }
    }));
  };

  // VAVの削除
  const deleteVAV = (id) => {
    setBuildingData(prev => ({
      ...prev,
      centralHVAC: {
        ...prev.centralHVAC,
        vavs: prev.centralHVAC.vavs.filter(v => v.id !== id)
      }
    }));
  };

  // VAVの更新
  const updateVAV = (id, field, value) => {
    setBuildingData(prev => ({
      ...prev,
      centralHVAC: {
        ...prev.centralHVAC,
        vavs: prev.centralHVAC.vavs.map(v => v.id === id ? { ...v, [field]: value } : v)
      }
    }));
  };

  // VRFの追加
  const addVRF = () => {
    const newVRF = {
      id: `VRF_Unit_${buildingData.individualHVAC.vrfs.length + 1}`,
      name: '',
      capacity: 0,
      powerRating: 0
    };
    setBuildingData(prev => ({
      ...prev,
      individualHVAC: {
        ...prev.individualHVAC,
        vrfs: [...prev.individualHVAC.vrfs, newVRF]
      }
    }));
  };

  // VRFの削除
  const deleteVRF = (id) => {
    setBuildingData(prev => ({
      ...prev,
      individualHVAC: {
        ...prev.individualHVAC,
        vrfs: prev.individualHVAC.vrfs.filter(v => v.id !== id)
      }
    }));
  };

  // VRFの更新
  const updateVRF = (id, field, value) => {
    setBuildingData(prev => ({
      ...prev,
      individualHVAC: {
        ...prev.individualHVAC,
        vrfs: prev.individualHVAC.vrfs.map(v => v.id === id ? { ...v, [field]: value } : v)
      }
    }));
  };

  // センサーの追加
  const addSensor = () => {
    const newSensor = {
      id: `Sensor_${buildingData.sensors.length + 1}`,
      name: '',
      type: 'temperature',
      equipmentId: '',
      unit: '°C'
    };
    setBuildingData(prev => ({
      ...prev,
      sensors: [...prev.sensors, newSensor]
    }));
  };

  // センサーの削除
  const deleteSensor = (id) => {
    setBuildingData(prev => ({
      ...prev,
      sensors: prev.sensors.filter(s => s.id !== id)
    }));
  };

  // センサーの更新
  const updateSensor = (id, field, value) => {
    setBuildingData(prev => ({
      ...prev,
      sensors: prev.sensors.map(s => s.id === id ? { ...s, [field]: value } : s)
    }));
  };

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-7xl mx-auto">
        {/* ヘッダー */}
        <div className="bg-white rounded-lg shadow-md p-6 mb-6">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-3">
              <Building className="w-8 h-8 text-blue-600" />
              <div>
                <h1 className="text-2xl font-bold text-gray-800">ハイブリッド空調システム 建物データエディタ</h1>
                <p className="text-sm text-gray-600">階層的な空調ゾーンと設備情報を管理</p>
              </div>
            </div>
          </div>

          {/* アクションボタン */}
          <div className="flex flex-wrap gap-2">
            <button
              onClick={loadSampleData}
              className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700"
            >
              <Upload className="w-4 h-4" />
              サンプルデータ読込
            </button>
            <button
              onClick={exportToJSON}
              className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
            >
              <Download className="w-4 h-4" />
              JSONエクスポート
            </button>
            <label className="flex items-center gap-2 px-4 py-2 bg-purple-600 text-white rounded-md hover:bg-purple-700 cursor-pointer">
              <Upload className="w-4 h-4" />
              JSONインポート
              <input
                type="file"
                accept=".json"
                onChange={importFromJSON}
                className="hidden"
              />
            </label>
            <button
              onClick={() => setShowJson(!showJson)}
              className="flex items-center gap-2 px-4 py-2 bg-gray-600 text-white rounded-md hover:bg-gray-700"
            >
              {showJson ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              {showJson ? 'JSON非表示' : 'JSON表示'}
            </button>
          </div>
        </div>

        {/* JSON表示エリア */}
        {showJson && (
          <div className="bg-gray-900 text-green-400 rounded-lg p-4 mb-6 overflow-auto max-h-96">
            <pre className="text-xs">{JSON.stringify(buildingData, null, 2)}</pre>
          </div>
        )}

        {/* タブナビゲーション */}
        <div className="bg-white rounded-lg shadow-md mb-6">
          <div className="flex overflow-x-auto border-b">
            {[
              { id: 'building', label: '建物情報', icon: Building },
              { id: 'floors', label: '階', icon: Layers },
              { id: 'zones', label: 'ゾーン', icon: Layers },
              { id: 'rooms', label: '部屋', icon: Building },
              { id: 'central', label: '全館空調', icon: Wind },
              { id: 'individual', label: '個別空調', icon: Wind },
              { id: 'sensors', label: 'センサー', icon: Thermometer }
            ].map(tab => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex items-center gap-2 px-6 py-3 font-medium border-b-2 transition-colors ${
                  activeTab === tab.id
                    ? 'border-blue-600 text-blue-600'
                    : 'border-transparent text-gray-600 hover:text-gray-800'
                }`}
              >
                <tab.icon className="w-4 h-4" />
                {tab.label}
              </button>
            ))}
          </div>

          <div className="p-6">
            {/* 建物情報タブ */}
            {activeTab === 'building' && (
              <div className="space-y-4">
                <h2 className="text-xl font-bold text-gray-800 mb-4">建物基本情報</h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">建物ID</label>
                    <input
                      type="text"
                      value={buildingData.building.id}
                      onChange={(e) => updateBuilding('id', e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">建物名</label>
                    <input
                      type="text"
                      value={buildingData.building.name}
                      onChange={(e) => updateBuilding('name', e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500"
                      placeholder="例: 東京グリーンタワー"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">所在地</label>
                    <input
                      type="text"
                      value={buildingData.building.location}
                      onChange={(e) => updateBuilding('location', e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500"
                      placeholder="例: 東京都千代田区"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">延床面積 (㎡)</label>
                    <input
                      type="number"
                      value={buildingData.building.totalArea}
                      onChange={(e) => updateBuilding('totalArea', parseFloat(e.target.value) || 0)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                </div>
              </div>
            )}

            {/* 階タブ */}
            {activeTab === 'floors' && (
              <div>
                <div className="flex items-center justify-between mb-4">
                  <h2 className="text-xl font-bold text-gray-800">階 ({buildingData.floors.length})</h2>
                  <button
                    onClick={addFloor}
                    className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
                  >
                    <Plus className="w-4 h-4" />
                    階を追加
                  </button>
                </div>
                <div className="space-y-3">
                  {buildingData.floors.map(floor => (
                    <div key={floor.id} className="flex items-center gap-3 p-4 bg-gray-50 rounded-lg">
                      <div className="flex-1 grid grid-cols-1 md:grid-cols-3 gap-3">
                        <input
                          type="text"
                          value={floor.id}
                          onChange={(e) => updateFloor(floor.id, 'id', e.target.value)}
                          className="px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500"
                          placeholder="ID"
                        />
                        <input
                          type="text"
                          value={floor.name}
                          onChange={(e) => updateFloor(floor.id, 'name', e.target.value)}
                          className="px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500"
                          placeholder="名称"
                        />
                        <input
                          type="number"
                          value={floor.area}
                          onChange={(e) => updateFloor(floor.id, 'area', parseFloat(e.target.value) || 0)}
                          className="px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500"
                          placeholder="面積 (㎡)"
                        />
                      </div>
                      <button
                        onClick={() => deleteFloor(floor.id)}
                        className="p-2 text-red-600 hover:bg-red-50 rounded-md"
                      >
                        <Trash2 className="w-5 h-5" />
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* ゾーンタブ */}
            {activeTab === 'zones' && (
              <div className="space-y-6">
                {/* 大ゾーン */}
                <div>
                  <div className="flex items-center justify-between mb-4">
                    <h2 className="text-xl font-bold text-gray-800">大ゾーン (全館空調担当) ({buildingData.largeZones.length})</h2>
                    <button
                      onClick={addLargeZone}
                      className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
                    >
                      <Plus className="w-4 h-4" />
                      大ゾーン追加
                    </button>
                  </div>
                  <div className="space-y-3">
                    {buildingData.largeZones.map(zone => (
                      <div key={zone.id} className="flex items-center gap-3 p-4 bg-blue-50 rounded-lg">
                        <div className="flex-1 grid grid-cols-1 md:grid-cols-4 gap-3">
                          <input
                            type="text"
                            value={zone.id}
                            onChange={(e) => updateLargeZone(zone.id, 'id', e.target.value)}
                            className="px-3 py-2 border border-gray-300 rounded-md"
                            placeholder="ID"
                          />
                          <input
                            type="text"
                            value={zone.name}
                            onChange={(e) => updateLargeZone(zone.id, 'name', e.target.value)}
                            className="px-3 py-2 border border-gray-300 rounded-md"
                            placeholder="名称"
                          />
                          <select
                            value={zone.floorId}
                            onChange={(e) => updateLargeZone(zone.id, 'floorId', e.target.value)}
                            className="px-3 py-2 border border-gray-300 rounded-md"
                          >
                            <option value="">階を選択</option>
                            {buildingData.floors.map(f => (
                              <option key={f.id} value={f.id}>{f.name}</option>
                            ))}
                          </select>
                          <select
                            value={zone.ahuId}
                            onChange={(e) => updateLargeZone(zone.id, 'ahuId', e.target.value)}
                            className="px-3 py-2 border border-gray-300 rounded-md"
                          >
                            <option value="">AHUを選択</option>
                            {buildingData.centralHVAC.ahus.map(a => (
                              <option key={a.id} value={a.id}>{a.name}</option>
                            ))}
                          </select>
                        </div>
                        <button
                          onClick={() => deleteLargeZone(zone.id)}
                          className="p-2 text-red-600 hover:bg-red-50 rounded-md"
                        >
                          <Trash2 className="w-5 h-5" />
                        </button>
                      </div>
                    ))}
                  </div>
                </div>

                {/* 小ゾーン */}
                <div>
                  <div className="flex items-center justify-between mb-4">
                    <h2 className="text-xl font-bold text-gray-800">小ゾーン (個別空調担当) ({buildingData.smallZones.length})</h2>
                    <button
                      onClick={addSmallZone}
                      className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700"
                    >
                      <Plus className="w-4 h-4" />
                      小ゾーン追加
                    </button>
                  </div>
                  <div className="space-y-3">
                    {buildingData.smallZones.map(zone => (
                      <div key={zone.id} className="flex items-center gap-3 p-4 bg-green-50 rounded-lg">
                        <div className="flex-1 grid grid-cols-1 md:grid-cols-4 gap-3">
                          <input
                            type="text"
                            value={zone.id}
                            onChange={(e) => updateSmallZone(zone.id, 'id', e.target.value)}
                            className="px-3 py-2 border border-gray-300 rounded-md"
                            placeholder="ID"
                          />
                          <input
                            type="text"
                            value={zone.name}
                            onChange={(e) => updateSmallZone(zone.id, 'name', e.target.value)}
                            className="px-3 py-2 border border-gray-300 rounded-md"
                            placeholder="名称"
                          />
                          <select
                            value={zone.largeZoneId}
                            onChange={(e) => updateSmallZone(zone.id, 'largeZoneId', e.target.value)}
                            className="px-3 py-2 border border-gray-300 rounded-md"
                          >
                            <option value="">大ゾーンを選択</option>
                            {buildingData.largeZones.map(lz => (
                              <option key={lz.id} value={lz.id}>{lz.name}</option>
                            ))}
                          </select>
                          <select
                            value={zone.vrfId}
                            onChange={(e) => updateSmallZone(zone.id, 'vrfId', e.target.value)}
                            className="px-3 py-2 border border-gray-300 rounded-md"
                          >
                            <option value="">VRFを選択</option>
                            {buildingData.individualHVAC.vrfs.map(v => (
                              <option key={v.id} value={v.id}>{v.name}</option>
                            ))}
                          </select>
                        </div>
                        <button
                          onClick={() => deleteSmallZone(zone.id)}
                          className="p-2 text-red-600 hover:bg-red-50 rounded-md"
                        >
                          <Trash2 className="w-5 h-5" />
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {/* 部屋タブ */}
            {activeTab === 'rooms' && (
              <div>
                <div className="flex items-center justify-between mb-4">
                  <h2 className="text-xl font-bold text-gray-800">部屋 ({buildingData.rooms.length})</h2>
                  <button
                    onClick={addRoom}
                    className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
                  >
                    <Plus className="w-4 h-4" />
                    部屋を追加
                  </button>
                </div>
                <div className="space-y-3">
                  {buildingData.rooms.map(room => (
                    <div key={room.id} className="flex items-center gap-3 p-4 bg-gray-50 rounded-lg">
                      <div className="flex-1 grid grid-cols-1 md:grid-cols-4 gap-3">
                        <input
                          type="text"
                          value={room.id}
                          onChange={(e) => updateRoom(room.id, 'id', e.target.value)}
                          className="px-3 py-2 border border-gray-300 rounded-md"
                          placeholder="ID"
                        />
                        <input
                          type="text"
                          value={room.name}
                          onChange={(e) => updateRoom(room.id, 'name', e.target.value)}
                          className="px-3 py-2 border border-gray-300 rounded-md"
                          placeholder="名称"
                        />
                        <select
                          value={room.smallZoneId}
                          onChange={(e) => updateRoom(room.id, 'smallZoneId', e.target.value)}
                          className="px-3 py-2 border border-gray-300 rounded-md"
                        >
                          <option value="">小ゾーンを選択</option>
                          {buildingData.smallZones.map(sz => (
                            <option key={sz.id} value={sz.id}>{sz.name}</option>
                          ))}
                        </select>
                        <input
                          type="number"
                          value={room.area}
                          onChange={(e) => updateRoom(room.id, 'area', parseFloat(e.target.value) || 0)}
                          className="px-3 py-2 border border-gray-300 rounded-md"
                          placeholder="面積 (㎡)"
                        />
                      </div>
                      <button
                        onClick={() => deleteRoom(room.id)}
                        className="p-2 text-red-600 hover:bg-red-50 rounded-md"
                      >
                        <Trash2 className="w-5 h-5" />
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* 全館空調タブ */}
            {activeTab === 'central' && (
              <div className="space-y-6">
                {/* チラー */}
                <div>
                  <div className="flex items-center justify-between mb-4">
                    <h2 className="text-xl font-bold text-gray-800">チラー ({buildingData.centralHVAC.chillers.length})</h2>
                    <button
                      onClick={addChiller}
                      className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
                    >
                      <Plus className="w-4 h-4" />
                      チラー追加
                    </button>
                  </div>
                  <div className="space-y-3">
                    {buildingData.centralHVAC.chillers.map(chiller => (
                      <div key={chiller.id} className="flex items-center gap-3 p-4 bg-blue-50 rounded-lg">
                        <div className="flex-1 grid grid-cols-1 md:grid-cols-4 gap-3">
                          <input
                            type="text"
                            value={chiller.id}
                            onChange={(e) => updateChiller(chiller.id, 'id', e.target.value)}
                            className="px-3 py-2 border border-gray-300 rounded-md"
                            placeholder="ID"
                          />
                          <input
                            type="text"
                            value={chiller.name}
                            onChange={(e) => updateChiller(chiller.id, 'name', e.target.value)}
                            className="px-3 py-2 border border-gray-300 rounded-md"
                            placeholder="名称"
                          />
                          <input
                            type="number"
                            value={chiller.capacity}
                            onChange={(e) => updateChiller(chiller.id, 'capacity', parseFloat(e.target.value) || 0)}
                            className="px-3 py-2 border border-gray-300 rounded-md"
                            placeholder="容量 (kW)"
                          />
                          <input
                            type="number"
                            value={chiller.powerRating}
                            onChange={(e) => updateChiller(chiller.id, 'powerRating', parseFloat(e.target.value) || 0)}
                            className="px-3 py-2 border border-gray-300 rounded-md"
                            placeholder="定格電力 (kW)"
                          />
                        </div>
                        <button
                          onClick={() => deleteChiller(chiller.id)}
                          className="p-2 text-red-600 hover:bg-red-50 rounded-md"
                        >
                          <Trash2 className="w-5 h-5" />
                        </button>
                      </div>
                    ))}
                  </div>
                </div>

                {/* AHU */}
                <div>
                  <div className="flex items-center justify-between mb-4">
                    <h2 className="text-xl font-bold text-gray-800">外調機 (AHU) ({buildingData.centralHVAC.ahus.length})</h2>
                    <button
                      onClick={addAHU}
                      className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700"
                    >
                      <Plus className="w-4 h-4" />
                      AHU追加
                    </button>
                  </div>
                  <div className="space-y-3">
                    {buildingData.centralHVAC.ahus.map(ahu => (
                      <div key={ahu.id} className="flex items-center gap-3 p-4 bg-green-50 rounded-lg">
                        <div className="flex-1 grid grid-cols-1 md:grid-cols-4 gap-3">
                          <input
                            type="text"
                            value={ahu.id}
                            onChange={(e) => updateAHU(ahu.id, 'id', e.target.value)}
                            className="px-3 py-2 border border-gray-300 rounded-md"
                            placeholder="ID"
                          />
                          <input
                            type="text"
                            value={ahu.name}
                            onChange={(e) => updateAHU(ahu.id, 'name', e.target.value)}
                            className="px-3 py-2 border border-gray-300 rounded-md"
                            placeholder="名称"
                          />
                          <select
                            value={ahu.chillerId}
                            onChange={(e) => updateAHU(ahu.id, 'chillerId', e.target.value)}
                            className="px-3 py-2 border border-gray-300 rounded-md"
                          >
                            <option value="">チラーを選択</option>
                            {buildingData.centralHVAC.chillers.map(c => (
                              <option key={c.id} value={c.id}>{c.name}</option>
                            ))}
                          </select>
                          <input
                            type="number"
                            value={ahu.airflow}
                            onChange={(e) => updateAHU(ahu.id, 'airflow', parseFloat(e.target.value) || 0)}
                            className="px-3 py-2 border border-gray-300 rounded-md"
                            placeholder="風量 (m³/h)"
                          />
                        </div>
                        <button
                          onClick={() => deleteAHU(ahu.id)}
                          className="p-2 text-red-600 hover:bg-red-50 rounded-md"
                        >
                          <Trash2 className="w-5 h-5" />
                        </button>
                      </div>
                    ))}
                  </div>
                </div>

                {/* VAV */}
                <div>
                  <div className="flex items-center justify-between mb-4">
                    <h2 className="text-xl font-bold text-gray-800">VAV ({buildingData.centralHVAC.vavs.length})</h2>
                    <button
                      onClick={addVAV}
                      className="flex items-center gap-2 px-4 py-2 bg-purple-600 text-white rounded-md hover:bg-purple-700"
                    >
                      <Plus className="w-4 h-4" />
                      VAV追加
                    </button>
                  </div>
                  <div className="space-y-3">
                    {buildingData.centralHVAC.vavs.map(vav => (
                      <div key={vav.id} className="flex items-center gap-3 p-4 bg-purple-50 rounded-lg">
                        <div className="flex-1 grid grid-cols-1 md:grid-cols-4 gap-3">
                          <input
                            type="text"
                            value={vav.id}
                            onChange={(e) => updateVAV(vav.id, 'id', e.target.value)}
                            className="px-3 py-2 border border-gray-300 rounded-md"
                            placeholder="ID"
                          />
                          <input
                            type="text"
                            value={vav.name}
                            onChange={(e) => updateVAV(vav.id, 'name', e.target.value)}
                            className="px-3 py-2 border border-gray-300 rounded-md"
                            placeholder="名称"
                          />
                          <select
                            value={vav.ahuId}
                            onChange={(e) => updateVAV(vav.id, 'ahuId', e.target.value)}
                            className="px-3 py-2 border border-gray-300 rounded-md"
                          >
                            <option value="">AHUを選択</option>
                            {buildingData.centralHVAC.ahus.map(a => (
                              <option key={a.id} value={a.id}>{a.name}</option>
                            ))}
                          </select>
                          <select
                            value={vav.largeZoneId}
                            onChange={(e) => updateVAV(vav.id, 'largeZoneId', e.target.value)}
                            className="px-3 py-2 border border-gray-300 rounded-md"
                          >
                            <option value="">大ゾーンを選択</option>
                            {buildingData.largeZones.map(lz => (
                              <option key={lz.id} value={lz.id}>{lz.name}</option>
                            ))}
                          </select>
                        </div>
                        <button
                          onClick={() => deleteVAV(vav.id)}
                          className="p-2 text-red-600 hover:bg-red-50 rounded-md"
                        >
                          <Trash2 className="w-5 h-5" />
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {/* 個別空調タブ */}
            {activeTab === 'individual' && (
              <div>
                <div className="flex items-center justify-between mb-4">
                  <h2 className="text-xl font-bold text-gray-800">VRF室外機 ({buildingData.individualHVAC.vrfs.length})</h2>
                  <button
                    onClick={addVRF}
                    className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
                  >
                    <Plus className="w-4 h-4" />
                    VRF追加
                  </button>
                </div>
                <div className="space-y-3">
                  {buildingData.individualHVAC.vrfs.map(vrf => (
                    <div key={vrf.id} className="flex items-center gap-3 p-4 bg-blue-50 rounded-lg">
                      <div className="flex-1 grid grid-cols-1 md:grid-cols-4 gap-3">
                        <input
                          type="text"
                          value={vrf.id}
                          onChange={(e) => updateVRF(vrf.id, 'id', e.target.value)}
                          className="px-3 py-2 border border-gray-300 rounded-md"
                          placeholder="ID"
                        />
                        <input
                          type="text"
                          value={vrf.name}
                          onChange={(e) => updateVRF(vrf.id, 'name', e.target.value)}
                          className="px-3 py-2 border border-gray-300 rounded-md"
                          placeholder="名称"
                        />
                        <input
                          type="number"
                          value={vrf.capacity}
                          onChange={(e) => updateVRF(vrf.id, 'capacity', parseFloat(e.target.value) || 0)}
                          className="px-3 py-2 border border-gray-300 rounded-md"
                          placeholder="容量 (kW)"
                        />
                        <input
                          type="number"
                          value={vrf.powerRating}
                          onChange={(e) => updateVRF(vrf.id, 'powerRating', parseFloat(e.target.value) || 0)}
                          className="px-3 py-2 border border-gray-300 rounded-md"
                          placeholder="定格電力 (kW)"
                        />
                      </div>
                      <button
                        onClick={() => deleteVRF(vrf.id)}
                        className="p-2 text-red-600 hover:bg-red-50 rounded-md"
                      >
                        <Trash2 className="w-5 h-5" />
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* センサータブ */}
            {activeTab === 'sensors' && (
              <div>
                <div className="flex items-center justify-between mb-4">
                  <h2 className="text-xl font-bold text-gray-800">センサー ({buildingData.sensors.length})</h2>
                  <button
                    onClick={addSensor}
                    className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
                  >
                    <Plus className="w-4 h-4" />
                    センサー追加
                  </button>
                </div>
                <div className="space-y-3">
                  {buildingData.sensors.map(sensor => (
                    <div key={sensor.id} className="flex items-center gap-3 p-4 bg-gray-50 rounded-lg">
                      <div className="flex-1 grid grid-cols-1 md:grid-cols-5 gap-3">
                        <input
                          type="text"
                          value={sensor.id}
                          onChange={(e) => updateSensor(sensor.id, 'id', e.target.value)}
                          className="px-3 py-2 border border-gray-300 rounded-md"
                          placeholder="ID"
                        />
                        <input
                          type="text"
                          value={sensor.name}
                          onChange={(e) => updateSensor(sensor.id, 'name', e.target.value)}
                          className="px-3 py-2 border border-gray-300 rounded-md"
                          placeholder="名称"
                        />
                        <select
                          value={sensor.type}
                          onChange={(e) => updateSensor(sensor.id, 'type', e.target.value)}
                          className="px-3 py-2 border border-gray-300 rounded-md"
                        >
                          <option value="temperature">温度</option>
                          <option value="humidity">湿度</option>
                          <option value="power">電力</option>
                          <option value="flow">風量</option>
                          <option value="pressure">圧力</option>
                        </select>
                        <input
                          type="text"
                          value={sensor.equipmentId}
                          onChange={(e) => updateSensor(sensor.id, 'equipmentId', e.target.value)}
                          className="px-3 py-2 border border-gray-300 rounded-md"
                          placeholder="設備ID"
                        />
                        <input
                          type="text"
                          value={sensor.unit}
                          onChange={(e) => updateSensor(sensor.id, 'unit', e.target.value)}
                          className="px-3 py-2 border border-gray-300 rounded-md"
                          placeholder="単位"
                        />
                      </div>
                      <button
                        onClick={() => deleteSensor(sensor.id)}
                        className="p-2 text-red-600 hover:bg-red-50 rounded-md"
                      >
                        <Trash2 className="w-5 h-5" />
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>

        {/* フッター統計 */}
        <div className="bg-white rounded-lg shadow-md p-6">
          <h3 className="text-lg font-bold text-gray-800 mb-4">データ統計</h3>
          <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-8 gap-4">
            <div className="text-center">
              <div className="text-2xl font-bold text-blue-600">{buildingData.floors.length}</div>
              <div className="text-sm text-gray-600">階</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-blue-600">{buildingData.largeZones.length}</div>
              <div className="text-sm text-gray-600">大ゾーン</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-green-600">{buildingData.smallZones.length}</div>
              <div className="text-sm text-gray-600">小ゾーン</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-gray-600">{buildingData.rooms.length}</div>
              <div className="text-sm text-gray-600">部屋</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-purple-600">{buildingData.centralHVAC.chillers.length}</div>
              <div className="text-sm text-gray-600">チラー</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-purple-600">{buildingData.centralHVAC.ahus.length}</div>
              <div className="text-sm text-gray-600">AHU</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-orange-600">{buildingData.individualHVAC.vrfs.length}</div>
              <div className="text-sm text-gray-600">VRF</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-red-600">{buildingData.sensors.length}</div>
              <div className="text-sm text-gray-600">センサー</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default BuildingDataEditor;
