import { useState, useRef, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { useDetect, useDraft, useCreateComplaint } from '../api/hooks';
import { compressImage } from '../lib/image';
import { reverseGeocode, searchAddressSuggestions, getCurrentPosition, KARUR_CENTER, type AddressSuggestion } from '../lib/geo';
import { AiResultCard } from '../components/AiResultCard';
import { DuplicateModal } from '../components/DuplicateModal';
import { Camera, Upload, MapPin, Loader2, Navigation, Search, Check, X, Sparkles, ArrowLeft } from 'lucide-react';
import { MapContainer, TileLayer, Marker, useMapEvents, useMap } from 'react-leaflet';
import L from 'leaflet';
import toast from 'react-hot-toast';

const markerIcon = L.icon({
  iconUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
  iconRetinaUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png',
  shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
  iconSize: [25, 41],
  iconAnchor: [12, 41]
});

const MapController = ({ center }: { center: [number, number] }) => {
  const map = useMap();
  useEffect(() => {
    map.flyTo(center, Math.max(map.getZoom(), 16), { animate: true });
  }, [center, map]);
  return null;
};

const LocationPicker = ({
  pos,
  onLocationChange,
}: {
  pos: [number, number];
  onLocationChange: (p: [number, number]) => void;
}) => {
  useMapEvents({
    click(e) {
      onLocationChange([e.latlng.lat, e.latlng.lng]);
    }
  });

  return (
    <Marker
      position={pos}
      icon={markerIcon}
      draggable
      eventHandlers={{
        dragend: (e) => {
          const marker = e.target;
          const latLng = marker.getLatLng();
          onLocationChange([latLng.lat, latLng.lng]);
        }
      }}
    />
  );
};

export const Report = () => {
  const { t, i18n } = useTranslation();
  const navigate = useNavigate();
  const fileInputRef = useRef<HTMLInputElement>(null);
  
  const [step, setStep] = useState(1);
  const [file, setFile] = useState<File | null>(null);
  const [preview, setPreview] = useState<string>('');
  
  const detectMutation = useDetect();
  const draftMutation = useDraft();
  const createMutation = useCreateComplaint();

  const [aiData, setAiData] = useState<any>(null);
  const [title, setTitle] = useState('');
  const [desc, setDesc] = useState('');
  const [pos, setPos] = useState<[number, number]>(KARUR_CENTER);
  const [address, setAddress] = useState('');
  const [mainRoad, setMainRoad] = useState(false);
  const [duplicateData, setDuplicateData] = useState<any>(null);

  const [isLocatingGPS, setIsLocatingGPS] = useState(false);
  const [isGeocoding, setIsGeocoding] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [suggestions, setSuggestions] = useState<AddressSuggestion[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const searchContainerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!searchQuery || searchQuery.trim().length < 2) {
      setSuggestions([]);
      setIsSearching(false);
      return;
    }

    const timer = setTimeout(async () => {
      setIsSearching(true);
      const results = await searchAddressSuggestions(searchQuery, i18n.language);
      setSuggestions(results);
      setIsSearching(false);
      setShowSuggestions(results.length > 0);
    }, 350);

    return () => clearTimeout(timer);
  }, [searchQuery, i18n.language]);

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (searchContainerRef.current && !searchContainerRef.current.contains(e.target as Node)) {
        setShowSuggestions(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleMapLocationChange = useCallback(async (newPos: [number, number]) => {
    setPos(newPos);
    setIsGeocoding(true);
    const resolvedAddress = await reverseGeocode(newPos[0], newPos[1], i18n.language);
    setIsGeocoding(false);
    if (resolvedAddress) {
      setAddress(resolvedAddress);
      setSearchQuery(resolvedAddress);
    }
  }, [i18n.language]);

  const handleUseCurrentGPS = async () => {
    setIsLocatingGPS(true);
    try {
      const position = await getCurrentPosition();
      const newPos: [number, number] = [position.coords.latitude, position.coords.longitude];
      setPos(newPos);
      toast.success(t('report.use_gps') || 'GPS location acquired!');
      
      setIsGeocoding(true);
      const resolvedAddress = await reverseGeocode(newPos[0], newPos[1], i18n.language);
      setIsGeocoding(false);
      if (resolvedAddress) {
        setAddress(resolvedAddress);
        setSearchQuery(resolvedAddress);
      }
    } catch (err: any) {
      toast.error(err?.message || 'Unable to access your GPS location. Please check browser permissions.');
    } finally {
      setIsLocatingGPS(false);
    }
  };

  const handleSelectSuggestion = (suggestion: AddressSuggestion) => {
    const newPos: [number, number] = [suggestion.lat, suggestion.lng];
    setPos(newPos);
    setAddress(suggestion.formattedAddress);
    setSearchQuery(suggestion.formattedAddress);
    setShowSuggestions(false);
    toast.success(t('report.location_label') || 'Location updated on map!');
  };

  const handleFile = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const f = e.target.files?.[0];
    if (!f) return;
    const compressed = await compressImage(f);
    setFile(compressed);
    setPreview(URL.createObjectURL(compressed));
    
    setStep(2);
    const fd = new FormData(); 
    fd.append('file', compressed);
    fd.append('lang', i18n.language);
    fd.append('main_road', mainRoad.toString());
    fd.append('address', address);
    detectMutation.mutate(fd, {
      onSuccess: (data) => {
        setAiData(data);
        if (data.is_valid === false || data.issue_type === 'invalid') {
          setTitle('');
          setDesc('');
          toast.error(
            data.message || (i18n.language === 'ta'
              ? 'இந்த புகாரை ஏற்க முடியாது. சிவிக் கார்டியன் சாலைகள், குடிநீர் மற்றும் தெருவிளக்கு பிரச்சினைகளுக்காக மட்டுமே வடிவமைக்கப்பட்டுள்ளது.'
              : 'This issue cannot be acknowledged because Civic Guardian is currently designed specifically for Roads, Water Supply, and Streetlight issues.'),
            { duration: 6000 }
          );
        } else {
          setTitle(data.title || data.draft_title || '');
          setDesc(data.description || data.draft_description || '');
        }
      },
      onError: () => {
        toast.error('AI Detection failed. Please upload a clear photo.');
        setAiData({ 
          image: 'demo_pothole_01.jpg',
          is_valid: true,
          ai_issue_type: 'pothole', 
          issue_type: 'pothole',
          confidence: 0.75, 
          severity: 'Medium', 
          severity_reason: 'severity.reason.moderate_pothole', 
          department_id: 'dept-roads', 
          department: { name_en: 'Highways & Roads', name_ta: 'நெடுஞ்சாலை மற்றும் சாலைகள்' },
          detector_mode: 'stub',
          title: i18n.language === 'ta' ? 'சாலை சேதம் புகாரளிக்கப்பட்டது' : 'Road Damage Reported',
          description: i18n.language === 'ta' ? 'குறிப்பிட்ட இடத்தில் சாலை சேதம் கண்டறியப்பட்டது. உடனடி சீரமைப்பு கோரப்படுகிறது.' : 'Road damage has been detected at the specified location. Urgent repair requested.'
        });
        setTitle(i18n.language === 'ta' ? 'சாலை சேதம் புகாரளிக்கப்பட்டது' : 'Road Damage Reported');
        setDesc(i18n.language === 'ta' ? 'குறிப்பிட்ட இடத்தில் சாலை சேதம் கண்டறியப்பட்டது. உடனடி சீரமைப்பு கோரப்படுகிறது.' : 'Road damage has been detected at the specified location. Urgent repair requested.');
      }
    });
  };

  const handleTypeChange = (newType: string) => {
    if (!aiData) return;
    const updatedAiData = { ...aiData, is_valid: true, issue_type: newType, ai_issue_type: newType };
    setAiData(updatedAiData);
    const fd = new FormData(); 
    fd.append('issue_type', newType);
    fd.append('severity', aiData.severity === 'invalid_issue' ? 'Medium' : (aiData.severity || 'Medium'));
    fd.append('address', address);
    fd.append('lang', i18n.language);
    draftMutation.mutate(fd, {
      onSuccess: (data) => { 
        setTitle(data.title); 
        setDesc(data.description);
        setAiData({ ...updatedAiData, ...data, is_valid: true });
      }
    });
  };

  const submitFinal = (forceNew = false) => {
    if (!aiData) return;
    if (aiData.is_valid === false || aiData.issue_type === 'invalid' || !['pothole', 'water_leak', 'streetlight'].includes(aiData.issue_type)) {
      toast.error(t('report.invalid_cannot_proceed') || 'This issue cannot be acknowledged because Civic Guardian is currently designed specifically for Roads, Water Supply, and Streetlight issues.');
      return;
    }
    const fd = new FormData();
    fd.append('image', aiData.image || 'demo_pothole_01.jpg');
    fd.append('issue_type', aiData.issue_type || aiData.ai_issue_type || 'pothole');
    fd.append('severity', aiData.severity || 'Medium');
    fd.append('severity_reason', aiData.severity_reason || '');
    fd.append('title', title || (i18n.language === 'ta' ? 'புகார் அளிக்கப்பட்டது' : 'Civic Issue Reported'));
    fd.append('description', desc || (i18n.language === 'ta' ? 'மாநகராட்சியில் புகார் பதிவு செய்யப்பட்டது.' : 'Civic issue reported.'));
    fd.append('lat', pos[0].toString());
    fd.append('lng', pos[1].toString());
    fd.append('address', address || 'Karur');
    fd.append('location_source', isLocatingGPS ? 'gps' : 'manual');
    fd.append('main_road', mainRoad.toString());
    fd.append('ai_issue_type', aiData.ai_issue_type || aiData.issue_type || 'pothole');
    fd.append('ai_confidence', (aiData.confidence || 0.8).toString());
    fd.append('detector_mode', aiData.detector_mode || 'stub');
    fd.append('force', forceNew.toString());
    fd.append('language', i18n.language);

    createMutation.mutate(fd, {
      onSuccess: (res) => {
        toast.success(t('report.success_title') || 'Issue reported successfully!');
        navigate(`/complaints/${res.id}`);
      },
      onError: (err: any) => {
        if (err.response?.status === 409) {
          setDuplicateData(err.response.data?.detail?.existing || err.response.data?.existing || err.response.data);
        } else {
          toast.error(err.response?.data?.detail || 'Failed to submit report');
        }
      }
    });
  };

  const stepLabels = [
    t('report.step_photo') || 'Photo',
    t('report.step_ai') || 'AI Result',
    t('report.step_location') || 'Location'
  ];

  return (
    <div className="max-w-3xl mx-auto pb-20 space-y-6">
      <div className="flex items-center gap-3">
        <button
          onClick={() => {
            if (step > 1) {
              setStep(step - 1);
            } else {
              navigate(-1);
            }
          }}
          className="p-2 rounded-lg border border-line bg-surface hover:bg-slate-blue-50 text-muted hover:text-ink transition-colors"
          title={t('common.back') || 'Back'}
        >
          <ArrowLeft className="w-5 h-5" />
        </button>
        <div>
          <h1 className="text-2xl font-bold text-ink">{t('nav.report') || 'Report an Issue'}</h1>
          <p className="text-xs text-muted">{t('app.tagline') || 'Spot it. Report it. Track it.'}</p>
        </div>
      </div>
      
      <div className="flex items-center justify-between mb-8 relative">
        <div className="absolute top-1/2 left-0 w-full h-1 bg-line -z-10 -translate-y-1/2" />
        {[1, 2, 3].map(i => (
          <div key={i} className="flex flex-col items-center gap-1 bg-surface px-2">
            <div
              className={`w-8 h-8 rounded-full flex items-center justify-center font-bold text-xs transition-colors ${
                step >= i
                  ? 'bg-slate-blue-600 text-white shadow-sm ring-4 ring-slate-blue-100'
                  : 'bg-white border-2 border-line text-muted'
              }`}
            >
              {i}
            </div>
            <span className={`text-[11px] font-semibold hidden sm:block ${step >= i ? 'text-slate-blue-900' : 'text-muted'}`}>
              {stepLabels[i - 1]}
            </span>
          </div>
        ))}
      </div>

      {step === 1 && (
        <div className="card p-8 text-center border-dashed border-2 border-slate-blue-300 bg-slate-blue-50/50 space-y-4">
          <input type="file" accept="image/*" className="hidden" ref={fileInputRef} onChange={handleFile} />
          <div className="w-16 h-16 bg-white rounded-full flex items-center justify-center mx-auto shadow-sm text-slate-blue-600 ring-4 ring-slate-blue-100">
            <Camera className="w-8 h-8" />
          </div>
          <div>
            <h2 className="text-xl font-bold mb-1 text-ink">{t('report.upload_photo') || 'Upload or Take a Photo'}</h2>
            <p className="text-muted text-xs max-w-sm mx-auto">{t('report.drag_drop') || 'Take a clear picture of the civic issue for instant AI analysis.'}</p>
          </div>
          <div className="flex gap-4 justify-center pt-2">
            <button
              onClick={() => fileInputRef.current?.click()}
              className="btn-primary h-11 px-6 flex items-center gap-2 text-xs shadow-sm font-semibold"
            >
              <Camera className="w-4 h-4" />
              <span>{t('report.take_photo') || 'Take Photo'}</span>
            </button>
            <button
              onClick={() => fileInputRef.current?.click()}
              className="btn-secondary h-11 px-6 flex items-center gap-2 text-xs font-semibold"
            >
              <Upload className="w-4 h-4" />
              <span>{t('report.browse') || 'Browse Files'}</span>
            </button>
          </div>
        </div>
      )}

      {step === 2 && (
        <div className="space-y-6">
          <div className="relative rounded-2xl overflow-hidden h-64 bg-black shadow-inner">
            <img src={preview} className="w-full h-full object-contain" alt="Issue preview" />
            <button
              onClick={() => setStep(1)}
              className="absolute top-3 right-3 bg-black/60 backdrop-blur-sm text-white px-3 py-1 rounded-full text-xs font-semibold hover:bg-black/80 transition-colors"
            >
              {t('report.retake') || 'Retake'}
            </button>
          </div>
          
          {detectMutation.isPending ? (
            <div className="card p-8 flex flex-col items-center justify-center text-slate-blue-600 h-64 space-y-3">
              <Loader2 className="w-10 h-10 animate-spin" />
              <p className="font-semibold text-sm animate-pulse">{t('report.ai_analyzing') || 'AI is analyzing your image...'}</p>
            </div>
          ) : aiData && (
            <AiResultCard
              confidence={aiData.confidence}
              issueType={aiData.issue_type || aiData.ai_issue_type}
              severity={aiData.severity}
              severityReason={aiData.severity_reason}
              department={aiData.department_id ? (t(`department.${aiData.department_id}`) || aiData.department_id) : ''}
              isStub={aiData.detector_mode === 'stub'}
              isValid={aiData.is_valid !== false && aiData.issue_type !== 'invalid'}
              invalidReason={i18n.language === 'ta' ? (aiData.message_ta || aiData.reason) : (aiData.message || aiData.reason)}
              title={title}
              description={desc}
              onTitleChange={setTitle}
              onDescChange={setDesc}
              onTypeChange={handleTypeChange}
            />
          )}
          
          <div className="flex gap-3 justify-between items-center pt-2">
            <button onClick={() => setStep(1)} className="btn-secondary h-11 px-6 text-xs font-semibold">
              {t('report.back') || 'Back'}
            </button>

            {aiData && (aiData.is_valid === false || aiData.issue_type === 'invalid') ? (
              <button
                onClick={() => {
                  setStep(1);
                  fileInputRef.current?.click();
                }}
                className="btn-primary bg-amber-600 hover:bg-amber-700 h-11 px-6 text-xs font-semibold shadow-sm flex items-center gap-2"
              >
                <Camera className="w-4 h-4" />
                <span>{t('report.invalid_retry_photo') || 'Upload a Valid Civic Photo'}</span>
              </button>
            ) : (
              <button
                onClick={() => setStep(3)}
                disabled={!aiData || aiData.is_valid === false || aiData.issue_type === 'invalid'}
                className="btn-primary h-11 px-8 text-sm font-semibold shadow-sm"
              >
                <span>{t('report.next') || 'Next'}: {t('report.step_location') || 'Location'}</span>
              </button>
            )}
          </div>
        </div>
      )}

      {step === 3 && (
        <div className="space-y-6">
          <div className="card p-5 space-y-4 shadow-sm border border-line">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div>
                <h3 className="font-bold text-base flex items-center gap-2 text-ink">
                  <MapPin className="text-slate-blue-600 w-5 h-5"/>
                  <span>{t('report.step_location') || 'Pinpoint Location'}</span>
                </h3>
                <p className="text-xs text-muted mt-0.5">
                  {t('report.location_helper') || 'Click/drag anywhere on the map or type to find and auto-fill address'}
                </p>
              </div>

              <button
                type="button"
                onClick={handleUseCurrentGPS}
                disabled={isLocatingGPS}
                className="btn-secondary h-9 px-3.5 text-xs font-semibold flex items-center gap-2 text-slate-blue-700 bg-slate-blue-50 border-slate-blue-200 hover:bg-slate-blue-100 transition-colors shadow-sm self-start sm:self-auto"
              >
                {isLocatingGPS ? (
                  <>
                    <Loader2 className="w-3.5 h-3.5 animate-spin text-slate-blue-600" />
                    <span>{t('report.acquiring_gps') || 'Acquiring GPS...'}</span>
                  </>
                ) : (
                  <>
                    <Navigation className="w-3.5 h-3.5 text-slate-blue-600 fill-slate-blue-600" />
                    <span>{t('report.use_gps') || 'Enable Current Location by GPS'}</span>
                  </>
                )}
              </button>
            </div>

            <div ref={searchContainerRef} className="relative">
              <label className="block text-xs font-semibold text-ink mb-1">
                {t('report.search_place') || 'Search Place / Type Address for Suggestions'}
              </label>
              <div className="relative">
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => {
                    setSearchQuery(e.target.value);
                    setAddress(e.target.value);
                  }}
                  onFocus={() => {
                    if (suggestions.length > 0) setShowSuggestions(true);
                  }}
                  placeholder={t('report.search_placeholder') || 'Type an area, road, landmark (e.g. Bus Stand, Karur)...'}
                  className="input w-full pl-9 pr-10 text-sm"
                />
                <Search className="w-4 h-4 text-muted absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
                {isSearching && (
                  <Loader2 className="w-4 h-4 text-slate-blue-600 animate-spin absolute right-3 top-1/2 -translate-y-1/2" />
                )}
                {!isSearching && searchQuery && (
                  <button
                    type="button"
                    onClick={() => {
                      setSearchQuery('');
                      setAddress('');
                      setSuggestions([]);
                      setShowSuggestions(false);
                    }}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-muted hover:text-ink p-0.5"
                  >
                    <X className="w-3.5 h-3.5" />
                  </button>
                )}
              </div>

              {showSuggestions && suggestions.length > 0 && (
                <div className="absolute left-0 right-0 top-full mt-1 bg-surface border border-line rounded-xl shadow-xl z-50 max-h-60 overflow-y-auto divide-y divide-line">
                  {suggestions.map((item, idx) => (
                    <button
                      key={idx}
                      type="button"
                      onClick={() => handleSelectSuggestion(item)}
                      className="w-full text-left px-3.5 py-2.5 text-xs hover:bg-slate-blue-50 transition-colors flex items-start gap-2.5 group"
                    >
                      <MapPin className="w-4 h-4 text-slate-blue-500 mt-0.5 flex-shrink-0 group-hover:scale-110 transition-transform" />
                      <div className="min-w-0 flex-1">
                        <div className="font-semibold text-ink truncate">{item.formattedAddress}</div>
                        <div className="text-[11px] text-muted truncate">{item.displayName}</div>
                      </div>
                    </button>
                  ))}
                </div>
              )}
            </div>

            <div className="relative">
              <div className="h-72 rounded-xl overflow-hidden border border-line z-0 shadow-inner">
                <MapContainer center={pos} zoom={16} style={{ height: '100%', width: '100%' }}>
                  <TileLayer
                    url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                    attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
                  />
                  <MapController center={pos} />
                  <LocationPicker pos={pos} onLocationChange={handleMapLocationChange} />
                </MapContainer>
              </div>

              {isGeocoding && (
                <div className="absolute bottom-3 left-3 bg-white/95 backdrop-blur-sm border border-slate-200 px-3 py-1.5 rounded-full shadow-md flex items-center gap-2 text-xs font-semibold text-slate-blue-700 z-[400] animate-pulse">
                  <Loader2 className="w-3.5 h-3.5 animate-spin" />
                  <span>{t('report.identifying_address') || 'Identifying address at clicked point...'}</span>
                </div>
              )}
            </div>

            <div>
              <div className="flex items-center justify-between mb-1">
                <label className="text-xs font-semibold text-ink flex items-center gap-1.5">
                  <MapPin className="w-3.5 h-3.5 text-slate-blue-600" />
                  <span>{t('report.address_field') || 'Selected Address / Landmark'}</span>
                </label>
                <span className="text-[11px] text-muted font-mono">
                  {pos[0].toFixed(5)}, {pos[1].toFixed(5)}
                </span>
              </div>
              <input
                type="text"
                value={address}
                onChange={e => setAddress(e.target.value)}
                className="input w-full text-sm"
                placeholder={t('report.address_placeholder') || 'e.g. Near Bus Stand, Main Bazaar, Karur'}
              />
            </div>

            <label className="flex items-center gap-2 text-xs font-semibold cursor-pointer text-ink pt-1">
              <input
                type="checkbox"
                checked={mainRoad}
                onChange={e => setMainRoad(e.target.checked)}
                className="w-4 h-4 rounded border-gray-300 text-slate-blue-600 focus:ring-slate-blue-600"
              />
              <span>{t('report.main_road_label') || 'This issue is on a main road / arterial road / major junction'}</span>
            </label>
          </div>
          
          <div className="flex gap-4 pt-2">
            <button onClick={() => setStep(2)} className="btn-secondary flex-1 h-11 text-xs font-semibold">
              {t('report.back') || 'Back'}
            </button>
            <button
              onClick={() => submitFinal(false)}
              disabled={createMutation.isPending}
              className="btn-primary flex-2 w-2/3 h-11 text-sm shadow-sm flex items-center justify-center gap-2 font-semibold"
            >
              {createMutation.isPending ? (
                <>
                  <Loader2 className="w-5 h-5 animate-spin" />
                  <span>{t('report.submitting') || 'Submitting Report...'}</span>
                </>
              ) : (
                <span>{t('report.submit') || 'Submit Report'}</span>
              )}
            </button>
          </div>
        </div>
      )}

      <DuplicateModal
        isOpen={!!duplicateData}
        onClose={() => setDuplicateData(null)}
        duplicate={duplicateData}
        isSubmitting={createMutation.isPending}
        onSubmitAnyway={() => { setDuplicateData(null); submitFinal(true); }}
        onSupport={() => {
           if (duplicateData) navigate(`/complaints/${duplicateData.id}`);
        }}
      />
    </div>
  );
};
