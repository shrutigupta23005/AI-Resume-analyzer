import { useState, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { useDropzone } from 'react-dropzone';
import { motion, AnimatePresence } from 'framer-motion';
import toast from 'react-hot-toast';
import api from '../services/api';
import { HiOutlineCloudUpload, HiOutlineDocumentText, HiOutlineX, HiOutlineChartBar, HiOutlineBriefcase, HiOutlineSparkles, HiOutlineEye } from 'react-icons/hi';

export default function UploadPage() {
  const [file, setFile] = useState(null);
  const [preview, setPreview] = useState(null); // PDF preview URL
  const [uploading, setUploading] = useState(false);
  const [uploadedResume, setUploadedResume] = useState(null);
  const [analyzing, setAnalyzing] = useState(false);
  const [showPreview, setShowPreview] = useState(false);
  const navigate = useNavigate();

  const onDrop = useCallback((acceptedFiles, rejectedFiles) => {
    if (rejectedFiles.length > 0) {
      toast.error('Only PDF files up to 10MB are allowed');
      return;
    }
    const selectedFile = acceptedFiles[0];
    setFile(selectedFile);
    // Create preview URL for PDF
    const url = URL.createObjectURL(selectedFile);
    setPreview(url);
  }, []);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop, accept: { 'application/pdf': ['.pdf'] }, maxSize: 10 * 1024 * 1024, maxFiles: 1,
  });

  const removeFile = () => {
    if (preview) URL.revokeObjectURL(preview);
    setFile(null);
    setPreview(null);
  };

  const handleUpload = async () => {
    if (!file) return;
    setUploading(true);
    try {
      const formData = new FormData();
      formData.append('resume', file);
      const res = await api.post('/resumes/upload', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });
      setUploadedResume(res.data.data.resume);
      toast.success('Resume uploaded successfully!');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Upload failed');
    } finally { setUploading(false); }
  };

  const handleAnalyze = async () => {
    if (!uploadedResume) return;
    setAnalyzing(true);
    try {
      const res = await api.post(`/analysis/${uploadedResume.id}`);
      toast.success('Analysis complete!');
      navigate(`/dashboard/analysis/${res.data.data.analysis._id}`);
    } catch (err) {
      toast.error(err.response?.data?.message || 'Analysis failed');
    } finally { setAnalyzing(false); }
  };

  return (
    <div className="max-w-3xl mx-auto space-y-8 animate-fade-in">
      <div>
        <h1 className="text-2xl md:text-3xl font-bold dark:text-white">Upload Resume</h1>
        <p className="text-surface-500 mt-1">Upload your PDF resume to get started with ATS analysis</p>
      </div>

      {/* Dropzone */}
      {!uploadedResume && (
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
          <div {...getRootProps()} className={`glass-card !p-12 text-center cursor-pointer border-2 border-dashed transition-all duration-300 ${isDragActive ? 'border-primary-500 bg-primary-500/5' : 'border-surface-300 dark:border-surface-600 hover:border-primary-400'}`}>
            <input {...getInputProps()} id="resume-dropzone" />
            <HiOutlineCloudUpload className={`w-16 h-16 mx-auto mb-4 ${isDragActive ? 'text-primary-500' : 'text-surface-400'}`} />
            {isDragActive ? (
              <p className="text-lg font-medium text-primary-600 dark:text-primary-400">Drop your PDF here...</p>
            ) : (
              <>
                <p className="text-lg font-medium dark:text-white mb-2">Drag & drop your resume here</p>
                <p className="text-sm text-surface-500">or click to browse · PDF only · Max 10MB</p>
              </>
            )}
          </div>

          {/* File Preview */}
          <AnimatePresence>
            {file && (
              <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} exit={{ opacity: 0, height: 0 }}
                className="mt-4 glass-card !p-4 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-lg bg-red-500/10 flex items-center justify-center">
                    <HiOutlineDocumentText className="w-5 h-5 text-red-500" />
                  </div>
                  <div>
                    <p className="text-sm font-medium dark:text-white">{file.name}</p>
                    <p className="text-xs text-surface-500">{(file.size / 1024).toFixed(0)} KB</p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <button onClick={() => setShowPreview(true)} className="p-2 rounded-lg hover:bg-surface-100 dark:hover:bg-surface-800 text-primary-500" title="Preview PDF">
                    <HiOutlineEye className="w-4 h-4" />
                  </button>
                  <button onClick={removeFile} className="p-2 rounded-lg hover:bg-surface-100 dark:hover:bg-surface-800">
                    <HiOutlineX className="w-4 h-4 text-surface-500" />
                  </button>
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          {/* PDF Preview Modal */}
          <AnimatePresence>
            {showPreview && preview && (
              <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                className="fixed inset-0 z-50 bg-black/60 flex items-center justify-center p-4" onClick={() => setShowPreview(false)}>
                <motion.div initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.9, opacity: 0 }}
                  className="bg-white dark:bg-surface-900 rounded-2xl overflow-hidden w-full max-w-3xl h-[80vh] flex flex-col shadow-2xl"
                  onClick={e => e.stopPropagation()}>
                  <div className="flex items-center justify-between px-6 py-4 border-b border-surface-200 dark:border-surface-700">
                    <h3 className="font-semibold dark:text-white flex items-center gap-2">
                      <HiOutlineEye className="w-5 h-5 text-primary-500" /> Resume Preview
                    </h3>
                    <button onClick={() => setShowPreview(false)} className="p-2 rounded-lg hover:bg-surface-100 dark:hover:bg-surface-800">
                      <HiOutlineX className="w-5 h-5 dark:text-white" />
                    </button>
                  </div>
                  <div className="flex-1 overflow-hidden">
                    <iframe src={preview} className="w-full h-full" title="Resume Preview" />
                  </div>
                </motion.div>
              </motion.div>
            )}
          </AnimatePresence>

          {file && (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="mt-4">
              <button onClick={handleUpload} disabled={uploading} className="btn-primary w-full !py-3.5 flex items-center justify-center gap-2" id="upload-btn">
                {uploading ? (
                  <><div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" /> Uploading...</>
                ) : (
                  <><HiOutlineCloudUpload className="w-5 h-5" /> Upload Resume</>
                )}
              </button>
            </motion.div>
          )}
        </motion.div>
      )}

      {/* Post-Upload Actions */}
      {uploadedResume && (
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="space-y-4">
          <div className="glass-card !p-5 flex items-center gap-4 border-emerald-500/30">
            <div className="w-12 h-12 rounded-xl bg-emerald-500/10 flex items-center justify-center">
              <HiOutlineDocumentText className="w-6 h-6 text-emerald-500" />
            </div>
            <div className="flex-1">
              <p className="font-medium dark:text-white">{uploadedResume.originalName}</p>
              <p className="text-xs text-surface-500">{uploadedResume.wordCount} words · {uploadedResume.pages} page(s) · {uploadedResume.status}</p>
            </div>
            <span className="text-xs font-medium px-3 py-1 rounded-full bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400">✓ Uploaded</span>
          </div>

          <h3 className="text-lg font-semibold dark:text-white pt-2">What would you like to do?</h3>
          <div className="grid gap-3 sm:grid-cols-3">
            <button onClick={handleAnalyze} disabled={analyzing}
              className="glass-card !p-5 text-left hover:border-primary-500/40 cursor-pointer group">
              <HiOutlineChartBar className="w-8 h-8 text-primary-500 mb-3 group-hover:scale-110 transition-transform" />
              <p className="font-semibold dark:text-white text-sm">ATS Analysis</p>
              <p className="text-xs text-surface-500 mt-1">Get your ATS score</p>
            </button>
            <button onClick={() => navigate(`/dashboard/job-match/${uploadedResume.id}`)}
              className="glass-card !p-5 text-left hover:border-emerald-500/40 cursor-pointer group">
              <HiOutlineBriefcase className="w-8 h-8 text-emerald-500 mb-3 group-hover:scale-110 transition-transform" />
              <p className="font-semibold dark:text-white text-sm">Job Match</p>
              <p className="text-xs text-surface-500 mt-1">Compare with JD</p>
            </button>
            <button onClick={() => navigate(`/dashboard/ai/${uploadedResume.id}`)}
              className="glass-card !p-5 text-left hover:border-accent-500/40 cursor-pointer group">
              <HiOutlineSparkles className="w-8 h-8 text-accent-500 mb-3 group-hover:scale-110 transition-transform" />
              <p className="font-semibold dark:text-white text-sm">AI Improve</p>
              <p className="text-xs text-surface-500 mt-1">Get AI suggestions</p>
            </button>
          </div>
        </motion.div>
      )}
    </div>
  );
}
