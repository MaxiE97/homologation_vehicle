// frontend/src/components/vehicleForm/UrlInputSection.tsx
import React from 'react';

interface UrlInputSectionProps {
  url1: string;
  setUrl1: (value: string) => void;
  url2: string;
  setUrl2: (value: string) => void;
  url3: string;
  setUrl3: (value: string) => void;
  transmissionOption: string;
  setTransmissionOption: (value: string) => void;
  onProcessUrls: () => void;
  isProcessing: boolean;
}

const UrlInputSection: React.FC<UrlInputSectionProps> = ({
  url1, setUrl1, url2, setUrl2, url3, setUrl3,
  transmissionOption, setTransmissionOption,
  onProcessUrls, isProcessing,
}) => {
  const inputClasses = "w-full px-3 py-2 rounded-lg border border-gray-300 focus:border-blue-500 focus:outline-none transition-colors duration-200 bg-white";
  const labelClasses = "block text-sm font-medium text-gray-700 mb-1";

  return (
    <div className="bg-white/80 backdrop-blur-sm rounded-xl border border-gray-200 p-6 mb-6 shadow">
      <h2 className="text-xl font-semibold text-gray-800 mb-4">Enter URLs and Options</h2>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="space-y-4">
          <div>
            <label htmlFor="url1" className={labelClasses}>Voertuig URL (Optional)</label>
            <input type="url" id="url1" value={url1} onChange={(e) => setUrl1(e.target.value)} placeholder="https://example.site1.com/vehicleA" className={inputClasses} />
          </div>
          <div>
            <label htmlFor="url2" className={labelClasses}>Typenscheine URL</label>
            <input type="url" id="url2" value={url2} onChange={(e) => setUrl2(e.target.value)} placeholder="https://example.site2.com/vehicleB" className={inputClasses} />
          </div>
          <div>
            <label htmlFor="url3" className={labelClasses}>Auto-data URL</label>
            <input type="url" id="url3" value={url3} onChange={(e) => setUrl3(e.target.value)} placeholder="https://example.site3.com/vehicleC" className={inputClasses} />
          </div>
        </div>

        <div className="space-y-4">
          <div>
            <label htmlFor="transmissionOption" className={labelClasses}>Transmission Option</label>
            <select id="transmissionOption" value={transmissionOption} onChange={(e) => setTransmissionOption(e.target.value)} className={inputClasses}>
              <option value="Default">Default</option>
              <option value="Manual">Manual</option>
              <option value="Automatic">Automatic</option>
            </select>
          </div>
          <div className="pt-5">
            <button
              onClick={onProcessUrls}
              disabled={isProcessing}
              className="w-full px-6 py-3 bg-gradient-to-r from-blue-500 to-cyan-500 text-white rounded-lg font-semibold transition-all duration-200 hover:shadow-lg focus:outline-none focus:ring-2 focus:ring-blue-300 disabled:opacity-70 disabled:cursor-wait"
            >
              {isProcessing ? 'Processing...' : 'Process URLs and Get Data'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default UrlInputSection;