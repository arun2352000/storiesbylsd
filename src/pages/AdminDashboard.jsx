import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { adminApi } from '../services/adminApi';
import JSZip from 'jszip';
import localforage from 'localforage';
import { toast } from 'react-toastify';


// Lightweight thumbnail renderer for selection modal
const SelectionThumbnail = ({ item, index, isSelected, onToggle, disabled }) => {
    const [objectUrl, setObjectUrl] = useState(null);

    useEffect(() => {
        let active = true;
        const loadThumb = async () => {
            let blob;
            if (item.type === 'zip_entry') {
                blob = await item.entry.async('blob');
            } else {
                blob = item.file;
            }
            if (active && blob) {
                const url = URL.createObjectURL(blob);
                setObjectUrl(url);
            }
        };
        loadThumb();
        return () => {
            active = false;
            if (objectUrl) URL.revokeObjectURL(objectUrl);
        };
    }, [item, isSelected]); // need to update if item changes

    return (
        <div 
            onClick={() => {
                if (!disabled || isSelected) onToggle(index);
            }}
            className={`relative aspect-square rounded-lg overflow-hidden border-2 cursor-pointer transition-colors ${
                isSelected ? 'border-indigo-600' : 'border-transparent hover:border-gray-300'
            } ${disabled && !isSelected ? 'opacity-50 cursor-not-allowed' : ''}`}
        >
            {objectUrl ? (
                <img src={objectUrl} alt={item.name} className="w-full h-full object-cover" />
            ) : (
                <div className="w-full h-full bg-gray-200 animate-pulse flex items-center justify-center text-xs text-gray-500">Loading...</div>
            )}
            
            {/* Checkbox Overlay */}
            <div className="absolute top-2 right-2 bg-white rounded-full p-0.5 shadow-sm">
                <div className={`w-5 h-5 rounded-full flex items-center justify-center border ${
                    isSelected ? 'bg-indigo-600 border-indigo-600' : 'border-gray-400 bg-white'
                }`}>
                    {isSelected && <svg className="w-3 h-3 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M5 13l4 4L19 7" /></svg>}
                </div>
            </div>
            
            {/* Filename Overlay */}
            <div className="absolute bottom-0 left-0 right-0 bg-black/60 p-1">
                <p className="text-[10px] text-white truncate px-1">{item.name}</p>
            </div>
        </div>
    );
};

const convertToWebP = (file) => {
    return new Promise((resolve) => {
        if (!file.type.startsWith('image/') || file.type === 'image/gif') {
            resolve(file);
            return;
        }
        if (file.type === 'image/webp' || file.name.toLowerCase().endsWith('.webp')) {
            resolve(file);
            return;
        }
        const img = new Image();
        const objectUrl = URL.createObjectURL(file);
        img.src = objectUrl;
        img.onload = () => {
            let width = img.width;
            let height = img.height;
            const MAX_DIMENSION = 1920;
            
            if (width > height && width > MAX_DIMENSION) {
                height = Math.round(height * (MAX_DIMENSION / width));
                width = MAX_DIMENSION;
            } else if (height > MAX_DIMENSION) {
                width = Math.round(width * (MAX_DIMENSION / height));
                height = MAX_DIMENSION;
            }

            const canvas = document.createElement('canvas');
            canvas.width = width;
            canvas.height = height;
            const ctx = canvas.getContext('2d');
            ctx.drawImage(img, 0, 0, width, height);
            
            canvas.toBlob((blob) => {
                URL.revokeObjectURL(objectUrl);
                canvas.width = 0; // Aggressive garbage collection
                canvas.height = 0;
                
                if (!blob || blob.size === 0) {
                    console.warn("WebP conversion failed or returned empty blob. Using original file.");
                    resolve(file);
                    return;
                }
                const newFilename = file.name.replace(/\.[^/.]+$/, "") + ".webp";
                const webpFile = new File([blob], newFilename, { type: 'image/webp' });
                resolve(webpFile);
            }, 'image/webp', 0.85);
        };
        img.onerror = () => {
            URL.revokeObjectURL(objectUrl);
            resolve(file);
        };
    });
};

const convertToLowResWebP = (file) => {
    return new Promise((resolve) => {
        if (!file.type.startsWith('image/') || file.type === 'image/gif') {
            resolve(file);
            return;
        }
        const img = new Image();
        const objectUrl = URL.createObjectURL(file);
        img.src = objectUrl;
        img.onload = () => {
            let width = img.width;
            let height = img.height;
            const MAX_DIMENSION = 50; // Tiny placeholder
            
            if (width > height && width > MAX_DIMENSION) {
                height = Math.round(height * (MAX_DIMENSION / width));
                width = MAX_DIMENSION;
            } else if (height > MAX_DIMENSION) {
                width = Math.round(width * (MAX_DIMENSION / height));
                height = MAX_DIMENSION;
            }

            const canvas = document.createElement('canvas');
            canvas.width = width;
            canvas.height = height;
            const ctx = canvas.getContext('2d');
            ctx.drawImage(img, 0, 0, width, height);
            
            canvas.toBlob((blob) => {
                URL.revokeObjectURL(objectUrl);
                canvas.width = 0;
                canvas.height = 0;
                
                if (!blob || blob.size === 0) {
                    resolve(file);
                    return;
                }
                const newFilename = file.name.replace(/\.[^/.]+$/, "") + "_lowres.webp";
                const webpFile = new File([blob], newFilename, { type: 'image/webp' });
                resolve(webpFile);
            }, 'image/webp', 0.1); // Ultra low quality
        };
        img.onerror = () => {
            URL.revokeObjectURL(objectUrl);
            resolve(file);
        };
    });
};

const convertVideoToWebM = (file, onProgress) => {
    return new Promise((resolve) => {
        if (!file || file.type === 'video/webm' || file.name.toLowerCase().endsWith('.webm')) {
            resolve(file);
            return;
        }

        const video = document.createElement('video');
        video.preload = 'auto';
        video.playsInline = true;
        const videoUrl = URL.createObjectURL(file);
        video.src = videoUrl;

        const supportedTypes = [
            'video/webm;codecs=vp9,opus',
            'video/webm;codecs=vp8,opus',
            'video/webm;codecs=vp9',
            'video/webm;codecs=vp8',
            'video/webm'
        ];
        const selectedMime = supportedTypes.find(t => typeof MediaRecorder !== 'undefined' && MediaRecorder.isTypeSupported && MediaRecorder.isTypeSupported(t));

        if (!selectedMime || (typeof video.captureStream !== 'function' && typeof video.mozCaptureStream !== 'function')) {
            console.warn("WebM recording not supported in this browser. Using original file.");
            URL.revokeObjectURL(videoUrl);
            resolve(file);
            return;
        }

        video.onloadedmetadata = () => {
            const duration = video.duration || 0;
            if (!isFinite(duration) || duration <= 0) {
                URL.revokeObjectURL(videoUrl);
                resolve(file);
                return;
            }

            const stream = video.captureStream ? video.captureStream() : video.mozCaptureStream();
            if (!stream) {
                URL.revokeObjectURL(videoUrl);
                resolve(file);
                return;
            }

            let audioCtx = null;
            try {
                const AudioContextClass = window.AudioContext || window.webkitAudioContext;
                if (AudioContextClass) {
                    audioCtx = new AudioContextClass();
                    const sourceNode = audioCtx.createMediaElementSource(video);
                    const destNode = audioCtx.createMediaStreamDestination();
                    sourceNode.connect(destNode);
                    destNode.stream.getAudioTracks().forEach(track => {
                        stream.addTrack(track);
                    });
                }
            } catch (e) {
                console.log("Audio routing info:", e);
            }

            let recorder;
            try {
                recorder = new MediaRecorder(stream, { mimeType: selectedMime });
            } catch (err) {
                console.warn("Failed to create MediaRecorder:", err);
                URL.revokeObjectURL(videoUrl);
                if (audioCtx) audioCtx.close();
                resolve(file);
                return;
            }

            const chunks = [];
            recorder.ondataavailable = (e) => {
                if (e.data && e.data.size > 0) {
                    chunks.push(e.data);
                }
            };

            const cleanup = () => {
                URL.revokeObjectURL(videoUrl);
                video.pause();
                video.removeAttribute('src');
                video.load();
                if (audioCtx && audioCtx.state !== 'closed') {
                    audioCtx.close();
                }
            };

            recorder.onstop = () => {
                cleanup();
                if (chunks.length === 0) {
                    resolve(file);
                    return;
                }
                const blob = new Blob(chunks, { type: 'video/webm' });
                const newFilename = file.name.replace(/\.[^/.]+$/, "") + ".webm";
                const webmFile = new File([blob], newFilename, { type: 'video/webm' });
                resolve(webmFile);
            };

            recorder.onerror = () => {
                cleanup();
                resolve(file);
            };

            video.ontimeupdate = () => {
                if (duration > 0 && onProgress) {
                    const percent = Math.min(99, Math.round((video.currentTime / duration) * 100));
                    onProgress(percent);
                }
            };

            video.onended = () => {
                if (recorder.state === 'recording') {
                    recorder.stop();
                }
            };

            recorder.start(100);
            video.playbackRate = 1.0;
            video.play().catch(err => {
                console.warn("Playback failed during conversion:", err);
                if (recorder.state === 'recording') recorder.stop();
                cleanup();
                resolve(file);
            });
        };

        video.onerror = () => {
            URL.revokeObjectURL(videoUrl);
            resolve(file);
        };
    });
};

const AdminDashboard = () => {
    const navigate = useNavigate();
    const [activeTab, setActiveTab] = useState('portfolio');
    
    const [portfolioItems, setPortfolioItems] = useState([]);
    const [films, setFilms] = useState([]);
    const [messages, setMessages] = useState([]);
    const [siteConfig, setSiteConfig] = useState(null);
    const [newHeroVideo, setNewHeroVideo] = useState(null);
    const [newHeroVideoThumb, setNewHeroVideoThumb] = useState(null);
    const [newFolioImages, setNewFolioImages] = useState([]);
    const [managedFolioImages, setManagedFolioImages] = useState([]);
    const [isFolioDirty, setIsFolioDirty] = useState(false);
    const [newTeamImages, setNewTeamImages] = useState([]);
    const [isHomeNavOpen, setIsHomeNavOpen] = useState(true);

    const [loading, setLoading] = useState(true);
    const [isUploading, setIsUploading] = useState(false);

    const [editingPortfolio, setEditingPortfolio] = useState(null);
    const [editPortfolioData, setEditPortfolioData] = useState({});
    
    // States for Reordering Images
    const [reorderingItem, setReorderingItem] = useState(null);
    const [reorderImages, setReorderImages] = useState([]);
    const [reorderLowResImages, setReorderLowResImages] = useState([]);
    const [isSavingOrder, setIsSavingOrder] = useState(false);

    // States for 100-Image Selection
    const [pendingSelectionImages, setPendingSelectionImages] = useState(null);
    const [selectedSelectionIndices, setSelectedSelectionIndices] = useState(new Set());

    const [newPortfolio, setNewPortfolio] = useState({ title: '', date: '', homePage: false });
    const [portfolioHero, setPortfolioHero] = useState(null);
    const [portfolioImages, setPortfolioImages] = useState([]);

    const [newFilm, setNewFilm] = useState({ title: '', date: '', videoUrl: '' });
    const [filmThumbnail, setFilmThumbnail] = useState(null);

    useEffect(() => {
        if (!adminApi.isAuthenticated()) {
            navigate('/admin/login');
        } else {
            loadData();
        }
    }, [navigate]);

    const loadData = async () => {
        setLoading(true);
        try {
            const [pi, f, m, sc] = await Promise.all([
                adminApi.getPortfolioItems(),
                adminApi.getFilms(),
                adminApi.getMessages(),
                adminApi.getSiteConfig()
            ]);
            setPortfolioItems(pi);
            setFilms(f);
            setMessages(m);
            setSiteConfig(sc);
            if (sc && Array.isArray(sc.folioImages)) {
                setManagedFolioImages(sc.folioImages);
            } else {
                setManagedFolioImages([]);
            }
            setIsFolioDirty(false);
        } catch (error) {
            console.error(error);
            if (error.message.includes('401')) {
                adminApi.logout();
                navigate('/admin/login');
            }
        }
        setLoading(false);
    };

    const refreshSiteConfig = async (forceOrder = false) => {
        try {
            const sc = await adminApi.getSiteConfig();
            if (sc) {
                setSiteConfig(sc);
                if (Array.isArray(sc.folioImages)) {
                    if (!isFolioDirty || forceOrder) {
                        setManagedFolioImages(sc.folioImages);
                    } else {
                        const urlMap = {};
                        sc.folioImages.forEach(img => {
                            if (img && img.id) {
                                urlMap[img.id] = img.url || img.downloadUrl;
                            }
                        });
                        setManagedFolioImages(prev => prev.map(item => ({
                            ...item,
                            url: urlMap[item.id] || item.url,
                            downloadUrl: urlMap[item.id] || item.downloadUrl
                        })));
                    }
                }
            }
        } catch (err) {
            console.error("Failed to refresh site config:", err);
        }
    };

    useEffect(() => {
        if (activeTab.startsWith('home_')) {
            refreshSiteConfig();
        }
    }, [activeTab]);

    const handleLogout = () => {
        adminApi.logout();
        navigate('/admin/login');
    };

    const handleFolioDragStart = (e, index) => {
        e.dataTransfer.setData('folioSourceIndex', index);
    };

    const handleFolioDrop = (e, targetIndex) => {
        const sourceIndex = e.dataTransfer.getData('folioSourceIndex');
        if (sourceIndex === '' || sourceIndex === targetIndex.toString()) return;
        const src = parseInt(sourceIndex, 10);
        setManagedFolioImages(prev => {
            const arr = [...prev];
            const [dragged] = arr.splice(src, 1);
            arr.splice(targetIndex, 0, dragged);
            return arr;
        });
        setIsFolioDirty(true);
    };

    const handleDeleteFolioImage = (indexToDelete) => {
        setManagedFolioImages(prev => prev.filter((_, idx) => idx !== indexToDelete));
        setIsFolioDirty(true);
    };

    const handleSaveFolioChanges = async () => {
        setIsUploading(true);
        const toastId = toast.loading("Saving updated folio order...");
        try {
            await adminApi.updateSiteConfig(
                { folioImages: managedFolioImages.map(img => ({ id: img.id })) },
                siteConfig ? siteConfig.id : null
            );
            setIsFolioDirty(false);
            await refreshSiteConfig(true);
            toast.update(toastId, { render: "Folio changes saved successfully!", type: "success", isLoading: false, autoClose: 3000 });
        } catch (err) {
            console.error("Folio save error:", err);
            toast.update(toastId, { render: "Failed to save folio changes.", type: "error", isLoading: false, autoClose: 3000 });
        } finally {
            setIsUploading(false);
        }
    };

    

    const handleDeletePortfolio = async (id) => {
        if (window.confirm('Are you sure you want to delete this portfolio item?')) {
            try {
                await adminApi.deletePortfolioItem(id);
                toast.success("Portfolio item deleted");
                loadData();
            } catch (error) {
                toast.error("Failed to delete portfolio item");
            }
        }
    };

    const handleUpdatePortfolio = async (id, field, value) => {
        try {
            await adminApi.updatePortfolioItem(id, { [field]: value });
            toast.success(`Successfully updated ${field}`);
            loadData();
        } catch (error) {
            toast.error(`Failed to update ${field}`);
        }
    };

    const openReorderModal = async (item) => {
        setReorderingItem(item);
        const toastId = toast.loading("Loading images...");
        try {
            const data = await adminApi.getPortfolioItem(item.id);
            
            // The images arrays usually just have basic object info without presigned URLs.
            // Let's fetch the hydrated files with downloadUrls from Aaly.
            const rawImages = data.images || [];
            const rawLowRes = data.imagesLowRes || [];
            
            const allIds = [...rawImages.map(img => img.id), ...rawLowRes.map(img => img.id)];
            
            let idToUrlMap = {};
            let idToNameMap = {};
            if (allIds.length > 0) {
                const fileData = await adminApi.getFiles(allIds);
                fileData.forEach(file => {
                    idToUrlMap[file.id] = file.downloadUrl || file.url || '';
                    idToNameMap[file.id] = file.filename || file.name || '';
                });
            }

            const hydratedImages = rawImages.map(img => ({ ...img, downloadUrl: idToUrlMap[img.id], filename: idToNameMap[img.id] || img.filename || img.name }));
            const hydratedLowRes = rawLowRes.map(img => ({ ...img, downloadUrl: idToUrlMap[img.id], filename: idToNameMap[img.id] || img.filename || img.name }));

            setReorderImages(hydratedImages);
            setReorderLowResImages(hydratedLowRes);
            toast.dismiss(toastId);
        } catch (error) {
            toast.update(toastId, { render: "Failed to load images", type: "error", isLoading: false, autoClose: 3000 });
            setReorderingItem(null);
        }
    };

    const handleReorderDragStart = (e, index) => {
        e.dataTransfer.setData('sourceIndex', index);
    };

    const handleReorderDrop = (e, targetIndex) => {
        const sourceIndex = e.dataTransfer.getData('sourceIndex');
        if (sourceIndex === '' || sourceIndex === targetIndex.toString()) return;
        
        const src = parseInt(sourceIndex, 10);
        
        setReorderImages(prev => {
            const arr = [...prev];
            const [dragged] = arr.splice(src, 1);
            arr.splice(targetIndex, 0, dragged);
            return arr;
        });

        setReorderLowResImages(prev => {
            if (!prev || prev.length !== reorderImages.length) return prev;
            const arr = [...prev];
            const [dragged] = arr.splice(src, 1);
            arr.splice(targetIndex, 0, dragged);
            return arr;
        });
    };

    const saveReorderedImages = async () => {
        if (!reorderingItem) return;
        setIsSavingOrder(true);
        const toastId = toast.loading("Saving new image order...");
        try {
            const updatedData = {
                images: reorderImages.map(img => ({ id: img.id }))
            };
            
            // Only update low res if arrays match
            if (reorderLowResImages && reorderLowResImages.length === reorderImages.length) {
                updatedData.imagesLowRes = reorderLowResImages.map(img => ({ id: img.id }));
            }

            await adminApi.updatePortfolioItem(reorderingItem.id, updatedData);
            toast.update(toastId, { render: "Order saved successfully!", type: "success", isLoading: false, autoClose: 3000 });
            setReorderingItem(null);
            loadData();
        } catch (error) {
            console.error("Save order error:", error);
            toast.update(toastId, { render: "Failed to save order", type: "error", isLoading: false, autoClose: 3000 });
        } finally {
            setIsSavingOrder(false);
        }
    };

    const confirmImageSelection = () => {
        if (!pendingSelectionImages) return;
        const selectedImages = [];
        pendingSelectionImages.forEach((img, idx) => {
            if (selectedSelectionIndices.has(idx)) {
                selectedImages.push(img);
            }
        });
        setPortfolioImages(prev => [...prev, ...selectedImages]);
        setPendingSelectionImages(null);
        setSelectedSelectionIndices(new Set());
    };

    const handleCreatePortfolio = async (e) => {
        e.preventDefault();
        if (isUploading) return;
        setIsUploading(true);

        const toastId = toast.loading("Initializing IndexedDB Buffer...");
        try {
            const bufferDB = localforage.createInstance({ name: 'lsd_upload_buffer' });
            await bufferDB.clear();

            // Phase 1: Process and Buffer to IndexedDB
            let heroWebP, heroLowResWebP;
            if (portfolioHero) {
                toast.update(toastId, { render: "Converting Hero Image..." });
                heroWebP = await convertToWebP(portfolioHero);
                heroLowResWebP = await convertToLowResWebP(portfolioHero);
            }

            for (let i = 0; i < portfolioImages.length; i++) {
                toast.update(toastId, { render: `⚙️ Converting to WebP (${i + 1}/${portfolioImages.length})...` });
                
                const item = portfolioImages[i];
                let fileToProcess;
                
                if (item.type === 'zip_entry') {
                    const blob = await item.entry.async('blob');
                    if (!blob || blob.size === 0) continue;
                    fileToProcess = new File([blob], item.name, { type: blob.type || 'image/jpeg' });
                } else {
                    fileToProcess = item.file;
                }
                
                const webpImage = await convertToWebP(fileToProcess);
                const webpLowRes = await convertToLowResWebP(fileToProcess);
                
                await bufferDB.setItem(`img_${i}_high`, webpImage);
                await bufferDB.setItem(`img_${i}_low`, webpLowRes);
            }

            // Phase 2: Upload from Buffer
            let heroImageId = null;
            let heroImageLowResId = null;
            if (heroWebP) {
                toast.update(toastId, { render: "Uploading Hero Image..." });
                const up = await adminApi.uploadFile(heroWebP);
                heroImageId = up.id;
                const upLow = await adminApi.uploadFile(heroLowResWebP);
                heroImageLowResId = upLow.id;
            }

            const imageIds = [];
            const imageLowResIds = [];
            for (let i = 0; i < portfolioImages.length; i++) {
                toast.update(toastId, { render: `☁️ Uploading to server (${i + 1}/${portfolioImages.length})...` });
                
                const high = await bufferDB.getItem(`img_${i}_high`);
                const low = await bufferDB.getItem(`img_${i}_low`);
                if (!high || !low) continue;

                const upHigh = await adminApi.uploadFile(high);
                imageIds.push(upHigh.id);
                
                const upLow = await adminApi.uploadFile(low);
                imageLowResIds.push(upLow.id);
                
                // Cleanup as we go
                await bufferDB.removeItem(`img_${i}_high`);
                await bufferDB.removeItem(`img_${i}_low`);
            }
            await bufferDB.clear();

            // Phase 3: Finalize
            toast.update(toastId, { render: "Saving project details..." });
            await adminApi.createPortfolioItem({
                title: newPortfolio.title,
                date: newPortfolio.date || new Date().toISOString().split('T')[0],
                homePage: newPortfolio.homePage,
                heroImage: heroImageId ? { id: heroImageId } : null,
                heroImageLowRes: heroImageLowResId ? { id: heroImageLowResId } : null,
                images: imageIds.map(id => ({ id })),
                imagesLowRes: imageLowResIds.map(id => ({ id }))
            });

            setNewPortfolio({ title: '', date: '', homePage: false });
            setPortfolioHero(null);
            setPortfolioImages([]);
            loadData();
            toast.update(toastId, { render: "Project created successfully!", type: "success", isLoading: false, autoClose: 3000 });
        } catch (error) {
            toast.update(toastId, { render: "Failed to create portfolio item.", type: "error", isLoading: false, autoClose: 3000 });
            console.error(error);
        } finally {
            setIsUploading(false);
        }
    };

    const handleCreateFilm = async (e) => {
        e.preventDefault();
        if (isUploading) return;
        setIsUploading(true);
        const toastId = toast.loading("Creating wedding film...");
        try {
            let thumbnailId = null;
            let thumbnailLowResId = null;
            if (filmThumbnail) {
                toast.update(toastId, { render: "Optimizing thumbnail..." });
                const webpThumb = await convertToWebP(filmThumbnail);
                const webpThumbLowRes = await convertToLowResWebP(filmThumbnail);
                
                const uploadedThumb = await adminApi.uploadFile(webpThumb);
                thumbnailId = uploadedThumb.id;
                
                const uploadedThumbLowRes = await adminApi.uploadFile(webpThumbLowRes);
                thumbnailLowResId = uploadedThumbLowRes.id;
            }

            toast.update(toastId, { render: "Saving film details..." });
            await adminApi.createFilm({
                title: newFilm.title,
                date: newFilm.date || new Date().toISOString().split('T')[0],
                videoUrl: newFilm.videoUrl,
                thumbnail: thumbnailId ? { id: thumbnailId } : null,
                thumbnailLowRes: thumbnailLowResId ? { id: thumbnailLowResId } : null
            });

            setNewFilm({ title: '', date: '', videoUrl: '' });
            setFilmThumbnail(null);
            loadData();
            toast.update(toastId, { render: "Film created successfully!", type: "success", isLoading: false, autoClose: 3000 });
        } catch (error) {
            toast.update(toastId, { render: "Failed to create film.", type: "error", isLoading: false, autoClose: 3000 });
            console.error(error);
        } finally {
            setIsUploading(false);
        }
    };

    const handleDeleteFilm = async (id) => {
        if (window.confirm('Are you sure?')) {
            await adminApi.deleteFilm(id);
            toast.success("Film deleted");
            loadData();
        }
    };

    const handleDeleteMessage = async (id) => {
        if (window.confirm('Are you sure?')) {
            await adminApi.deleteMessage(id);
            toast.success("Message deleted");
            loadData();
        }
    };

    const handleUpdateSiteConfig = async (e) => {
        e.preventDefault();
        if (isUploading) return;
        setIsUploading(true);
        const toastId = toast.loading("Saving changes...");
        try {
            const updatedPayload = {};
            if (activeTab === 'home_video') {
                if (!newHeroVideo && !newHeroVideoThumb) {
                    toast.update(toastId, { render: "Please select a video or a thumbnail image.", type: "error", isLoading: false, autoClose: 3000 });
                    setIsUploading(false);
                    return;
                }

                if (newHeroVideo) {
                    let videoFile = newHeroVideo;
                    if (newHeroVideo.type !== 'video/webm' && !newHeroVideo.name.toLowerCase().endsWith('.webm')) {
                        toast.update(toastId, { render: "Converting video to WebM format..." });
                        videoFile = await convertVideoToWebM(newHeroVideo, (pct) => {
                            toast.update(toastId, { render: `Converting video to WebM (${pct}%)...` });
                        });
                    }

                    toast.update(toastId, { render: "Uploading WebM video..." });
                    const uploaded = await adminApi.uploadFile(videoFile);
                    updatedPayload.heroVideo = { id: uploaded.id };
                }

                if (newHeroVideoThumb) {
                    toast.update(toastId, { render: "Converting thumbnail to WebP..." });
                    let webpThumb = await convertToWebP(newHeroVideoThumb);
                    if (!webpThumb || webpThumb.size === 0) {
                        webpThumb = newHeroVideoThumb;
                    }

                    toast.update(toastId, { render: "Uploading video thumbnail..." });
                    const upThumb = await adminApi.uploadFile(webpThumb);
                    updatedPayload.heroVideoThumb = { id: upThumb.id };
                }
            } else if (activeTab === 'home_folio') {
                if (newFolioImages.length === 0) {
                    toast.update(toastId, { render: "Please select at least one image.", type: "error", isLoading: false, autoClose: 3000 });
                    setIsUploading(false);
                    return;
                }
                const uploadedFiles = [];
                for (let i = 0; i < newFolioImages.length; i++) {
                    const originalImg = newFolioImages[i];
                    toast.update(toastId, { render: `Converting folio image ${i + 1}/${newFolioImages.length} to WebP...` });
                    let webpFile = await convertToWebP(originalImg);
                    if (!webpFile || webpFile.size === 0) {
                        webpFile = originalImg;
                    }

                    toast.update(toastId, { render: `Uploading folio image ${i + 1}/${newFolioImages.length}...` });
                    const up = await adminApi.uploadFile(webpFile);
                    uploadedFiles.push({ id: up.id, url: URL.createObjectURL(webpFile) });
                }
                // Append new uploads to currently managed folio images
                const combined = [...managedFolioImages, ...uploadedFiles];
                updatedPayload.folioImages = combined.map(img => ({ id: img.id }));
            } else if (activeTab === 'home_team') {
                if (newTeamImages.length === 0) {
                    toast.update(toastId, { render: "Please select at least one portrait.", type: "error", isLoading: false, autoClose: 3000 });
                    setIsUploading(false);
                    return;
                }
                const uploadedFiles = [];
                for (let i = 0; i < newTeamImages.length; i++) {
                    const originalImg = newTeamImages[i];
                    toast.update(toastId, { render: `Converting team portrait ${i + 1}/${newTeamImages.length} to WebP...` });
                    let webpFile = await convertToWebP(originalImg);
                    if (!webpFile || webpFile.size === 0) {
                        webpFile = originalImg;
                    }

                    toast.update(toastId, { render: `Uploading team portrait ${i + 1}/${newTeamImages.length}...` });
                    const up = await adminApi.uploadFile(webpFile);
                    uploadedFiles.push({ id: up.id });
                }
                updatedPayload.teamImages = uploadedFiles;
            }

            toast.update(toastId, { render: "Saving configuration..." });
            await adminApi.updateSiteConfig(updatedPayload, siteConfig ? siteConfig.id : null);
            setNewHeroVideo(null);
            setNewHeroVideoThumb(null);
            setNewFolioImages([]);
            setNewTeamImages([]);
            setIsFolioDirty(false);
            await loadData();
            toast.update(toastId, { render: "Home Page updated successfully!", type: "success", isLoading: false, autoClose: 3000 });
        } catch (error) {
            console.error("Save config error:", error);
            toast.update(toastId, { render: "Failed to update: " + (error.message || "Unknown error"), type: "error", isLoading: false, autoClose: 3000 });
        } finally {
            setIsUploading(false);
        }
    };

    const handleZipDrop = async (e) => {
        e.preventDefault();
        const files = Array.from(e.dataTransfer ? e.dataTransfer.files : e.target.files);
        if (files.length === 0) return;

        try {
            const allExtractedImages = [];
            
            for (let file of files) {
                if (file.name.endsWith('.zip')) {
                    const zip = await JSZip.loadAsync(file);
                    
                    zip.forEach((relativePath, zipEntry) => {
                        // Ignore directories, macOS hidden files (._*), and __MACOSX folders
                        const isMacHidden = zipEntry.name.includes('__MACOSX') || zipEntry.name.split('/').pop().startsWith('._');
                        
                        if (!zipEntry.dir && !isMacHidden && zipEntry.name.match(/\.(jpg|jpeg|png|webp|gif)$/i)) {
                            allExtractedImages.push({
                                type: 'zip_entry',
                                entry: zipEntry,
                                name: zipEntry.name.split('/').pop()
                            });
                        }
                    });
                } else if (file.type.startsWith('image/')) {
                    allExtractedImages.push({
                        type: 'file',
                        file: file,
                        name: file.name
                    });
                }
            } // Added missing closing brace for the `for` loop
            // Sort alphabetically and naturally by name (e.g. 1.jpg, 2.jpg, 10.jpg)
            allExtractedImages.sort((a, b) => a.name.localeCompare(b.name, undefined, { numeric: true, sensitivity: 'base' }));

            setPortfolioImages(prev => {
                const combined = [...prev, ...allExtractedImages];
                if (combined.length > 100) {
                    toast.warning(`Maximum 100 images allowed per portfolio. Automatically trimmed ${combined.length - 100} extra images.`);
                    return combined.slice(0, 100);
                }
                return combined;
            });
            if (e.target.value) e.target.value = '';

        } catch (err) {
            alert("Failed to process files.");
            console.error(err);
        }
    };

    const handleDragOver = (e) => {
        e.preventDefault();
    };

    if (loading) return (
        <div className="flex h-screen w-full items-center justify-center bg-gray-50">
            <div className="flex flex-col items-center gap-4">
                <div className="h-10 w-10 animate-spin rounded-full border-4 border-gray-300 border-t-gray-900"></div>
                <p className="text-gray-600 font-medium">Loading Admin Data...</p>
            </div>
        </div>
    );

    const TabButton = ({ tab, label, icon }) => (
        <button
            onClick={() => setActiveTab(tab)}
            className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg font-medium transition-colors ${activeTab === tab ? 'bg-gray-900 text-white shadow-md' : 'text-gray-600 hover:bg-gray-100 hover:text-gray-900'}`}
        >
            {icon}
            {label}
        </button>
    );

    return (
        <div className="flex min-h-screen bg-gray-50 font-sans">
            {/* Sidebar */}
            <aside className="w-72 bg-white border-r border-gray-200 flex flex-col shadow-sm hidden md:flex">
                <div className="p-6 border-b border-gray-200">
                    <h2 className="text-2xl font-bold tracking-tight text-gray-900">LSD Admin</h2>
                    <p className="text-sm text-gray-500 mt-1">Portfolio Management</p>
                </div>
                <nav className="flex-1 p-4 space-y-2">
                    <TabButton tab="portfolio" label="Portfolio Items" icon={
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"></path></svg>
                    } />
                    <TabButton tab="films" label="Wedding Films" icon={
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M7 4v16M17 4v16M3 8h4m10 0h4M3 12h18M3 16h4m10 0h4M4 20h16a1 1 0 001-1V5a1 1 0 00-1-1H4a1 1 0 00-1 1v14a1 1 0 001 1z"></path></svg>
                    } />
                    <TabButton tab="messages" label="Messages" icon={
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"></path></svg>
                    } />
                    <div className="space-y-1">
                        <button
                            onClick={() => setIsHomeNavOpen(!isHomeNavOpen)}
                            className={`w-full flex items-center justify-between px-4 py-3 rounded-lg font-medium transition-colors ${activeTab.startsWith('home_') ? 'bg-gray-100 text-gray-900 font-semibold' : 'text-gray-600 hover:bg-gray-100'}`}
                        >
                            <div className="flex items-center gap-3">
                                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z"></path><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"></path></svg>
                                Home Page
                            </div>
                            <svg className={`w-4 h-4 transition-transform ${isHomeNavOpen ? 'rotate-180' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7"></path></svg>
                        </button>
                        
                        {isHomeNavOpen && (
                            <div className="pl-11 pr-4 py-1 space-y-1">
                                <button onClick={() => { setActiveTab('home_video'); refreshSiteConfig(); }} className={`w-full text-left px-3 py-2 text-sm rounded-md transition-colors ${activeTab === 'home_video' ? 'bg-gray-900 text-white shadow-md' : 'text-gray-600 hover:bg-gray-100 hover:text-gray-900'}`}>Hero Video</button>
                                <button onClick={() => { setActiveTab('home_folio'); refreshSiteConfig(); }} className={`w-full text-left px-3 py-2 text-sm rounded-md transition-colors ${activeTab === 'home_folio' ? 'bg-gray-900 text-white shadow-md' : 'text-gray-600 hover:bg-gray-100 hover:text-gray-900'}`}>Image Folio</button>
                                <button onClick={() => { setActiveTab('home_team'); refreshSiteConfig(); }} className={`w-full text-left px-3 py-2 text-sm rounded-md transition-colors ${activeTab === 'home_team' ? 'bg-gray-900 text-white shadow-md' : 'text-gray-600 hover:bg-gray-100 hover:text-gray-900'}`}>Team Portraits</button>
                            </div>
                        )}
                    </div>
                </nav>
                <div className="p-4 border-t border-gray-200">
                    <button onClick={handleLogout} className="w-full flex items-center justify-center gap-2 px-4 py-2.5 rounded-lg font-medium text-red-600 bg-red-50 hover:bg-red-100 transition-colors">
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1"></path></svg>
                        Sign Out
                    </button>
                </div>
            </aside>

            {/* Mobile Header */}
            <div className="md:hidden fixed top-0 left-0 right-0 h-16 bg-white border-b border-gray-200 flex items-center justify-between px-4 z-50">
                <h2 className="text-xl font-bold text-gray-900">LSD Admin</h2>
                <div className="flex gap-2">
                    <select 
                        value={activeTab} 
                        onChange={(e) => setActiveTab(e.target.value)}
                        className="bg-gray-100 border-none text-sm font-medium rounded-lg px-3 py-2 focus:ring-2 focus:ring-gray-900"
                    >
                        <option value="portfolio">Portfolio</option>
                        <option value="films">Films</option>
                        <option value="messages">Messages</option>
                        <option value="settings">Settings</option>
                    </select>
                </div>
            </div>

            {/* Main Content */}
            <main className="flex-1 p-6 md:p-10 pt-20 md:pt-10 overflow-y-auto">
                <div className="max-w-6xl mx-auto">
                    
                    {/* PORTFOLIO TAB */}
                    {activeTab === 'portfolio' && (
                        <div className="animate-fadeIn">
                            <div className="mb-8 flex justify-between items-end">
                                <div>
                                    <h1 className="text-3xl font-bold text-gray-900">Portfolio Items</h1>
                                    <p className="text-gray-500 mt-2">Manage your photography projects and galleries.</p>
                                </div>
                            </div>
                            
                            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                                {/* Creation Form */}
                                <div className="lg:col-span-1">
                                    <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 sticky top-6">
                                        <h3 className="text-xl font-semibold mb-6">Add New Project</h3>
                                        <form onSubmit={handleCreatePortfolio} className="space-y-5">
                                            <div>
                                                <label className="block text-sm font-medium text-gray-700 mb-1">Project Title</label>
                                                <input type="text" placeholder="e.g. Appu & Keerthi" value={newPortfolio.title} onChange={e => setNewPortfolio({...newPortfolio, title: e.target.value})} required className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-gray-900 focus:border-transparent outline-none transition-all" />
                                            </div>
                                            <div>
                                                <label className="block text-sm font-medium text-gray-700 mb-1">Date</label>
                                                <input type="date" value={newPortfolio.date} onChange={e => setNewPortfolio({...newPortfolio, date: e.target.value})} className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-gray-900 focus:border-transparent outline-none transition-all" />
                                            </div>
                                            <div className="flex items-center">
                                                <input type="checkbox" id="homePage" checked={newPortfolio.homePage} onChange={e => setNewPortfolio({...newPortfolio, homePage: e.target.checked})} className="w-4 h-4 text-gray-900 border-gray-300 rounded focus:ring-gray-900" />
                                                <label htmlFor="homePage" className="ml-2 block text-sm font-medium text-gray-700">Feature on Home Page</label>
                                            </div>
                                            
                                            <div className="pt-4 border-t border-gray-100">
                                                <label className="block text-sm font-medium text-gray-700 mb-2">Hero Image (Cover)</label>
                                                <div className="mt-1 flex justify-center px-6 pt-5 pb-6 border-2 border-gray-300 border-dashed rounded-lg hover:border-gray-400 transition-colors bg-gray-50">
                                                    <div className="space-y-1 text-center">
                                                        <svg className="mx-auto h-12 w-12 text-gray-400" stroke="currentColor" fill="none" viewBox="0 0 48 48"><path d="M28 8H12a4 4 0 00-4 4v20m32-12v8m0 0v8a4 4 0 01-4 4H12a4 4 0 01-4-4v-4m32-4l-3.172-3.172a4 4 0 00-5.656 0L28 28M8 32l9.172-9.172a4 4 0 015.656 0L28 28m0 0l4 4m4-24h8m-4-4v8m-12 4h.02" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" /></svg>
                                                        <div className="flex text-sm text-gray-600 justify-center">
                                                            <label className="relative cursor-pointer bg-white rounded-md font-medium text-indigo-600 hover:text-indigo-500 focus-within:outline-none px-1">
                                                                <span>Upload a file</span>
                                                                <input type="file" onChange={e => setPortfolioHero(e.target.files[0])} accept="image/*" className="sr-only" />
                                                            </label>
                                                        </div>
                                                        <p className="text-xs text-gray-500">PNG, JPG up to 10MB</p>
                                                        {portfolioHero && <p className="text-xs font-semibold text-green-600 mt-2 truncate max-w-[200px]">{portfolioHero.name}</p>}
                                                    </div>
                                                </div>
                                            </div>

                                            <div>
                                                <label className="block text-sm font-medium text-gray-700 mb-2">Gallery Images or ZIP File</label>
                                                <div 
                                                    onDrop={handleZipDrop}
                                                    onDragOver={handleDragOver}
                                                    className="mt-1 flex justify-center px-6 pt-5 pb-6 border-2 border-gray-300 border-dashed rounded-lg hover:border-gray-400 transition-colors bg-gray-50 cursor-pointer"
                                                >
                                                    <div className="space-y-1 text-center">
                                                        <svg className="mx-auto h-12 w-12 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 8h14M5 8a2 2 0 110-4h14a2 2 0 110 4M5 8v10a2 2 0 002 2h10a2 2 0 002-2V8m-9 4h4"></path></svg>
                                                        <div className="flex text-sm text-gray-600 justify-center">
                                                            <label className="relative cursor-pointer bg-white rounded-md font-medium text-indigo-600 hover:text-indigo-500 focus-within:outline-none px-1">
                                                                <span>Drag & drop ZIP/Images</span>
                                                                <input type="file" multiple accept="image/*,.zip" onChange={handleZipDrop} className="sr-only" />
                                                            </label>
                                                        </div>
                                                        <p className="text-xs text-gray-500">Bulk upload supported</p>
                                                    </div>
                                                </div>
                                                {portfolioImages.length > 0 && (
                                                    <div className="mt-3 p-3 bg-blue-50 rounded-lg border border-blue-100">
                                                        <div className="flex justify-between items-center mb-2">
                                                            <p className="text-xs font-semibold text-blue-800">{portfolioImages.length} files staged for upload:</p>
                                                            <button type="button" onClick={() => setPortfolioImages([])} className="text-xs text-red-600 hover:text-red-800">Clear All</button>
                                                        </div>
                                                        <ul className="text-xs text-blue-700 space-y-1 max-h-40 overflow-y-auto pr-2">
                                                            {portfolioImages.map((f, i) => (
                                                                <li key={i} className="flex justify-between items-center bg-white/50 p-1 rounded">
                                                                    <span className="truncate w-3/4">{f.name}</span>
                                                                    <div className="flex gap-1">
                                                                        <button 
                                                                            type="button" 
                                                                            disabled={i === 0}
                                                                            onClick={() => {
                                                                                setPortfolioImages(prev => {
                                                                                    const arr = [...prev];
                                                                                    [arr[i - 1], arr[i]] = [arr[i], arr[i - 1]];
                                                                                    return arr;
                                                                                });
                                                                            }} 
                                                                            className="p-1 hover:bg-blue-100 rounded disabled:opacity-30"
                                                                        >
                                                                            <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 15l7-7 7 7"></path></svg>
                                                                        </button>
                                                                        <button 
                                                                            type="button" 
                                                                            disabled={i === portfolioImages.length - 1}
                                                                            onClick={() => {
                                                                                setPortfolioImages(prev => {
                                                                                    const arr = [...prev];
                                                                                    [arr[i + 1], arr[i]] = [arr[i], arr[i + 1]];
                                                                                    return arr;
                                                                                });
                                                                            }} 
                                                                            className="p-1 hover:bg-blue-100 rounded disabled:opacity-30"
                                                                        >
                                                                            <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7"></path></svg>
                                                                        </button>
                                                                        <button 
                                                                            type="button"
                                                                            onClick={() => {
                                                                                setPortfolioImages(prev => prev.filter((_, idx) => idx !== i));
                                                                            }}
                                                                            className="p-1 hover:bg-red-100 text-red-500 rounded ml-1"
                                                                        >
                                                                            <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12"></path></svg>
                                                                        </button>
                                                                    </div>
                                                                </li>
                                                            ))}
                                                        </ul>
                                                    </div>
                                                )}
                                            </div>

                                            <button type="submit" disabled={isUploading} className={`w-full py-3 px-4 border border-transparent rounded-lg shadow-sm text-sm font-medium text-white transition-colors ${isUploading ? 'bg-gray-400 cursor-not-allowed' : 'bg-gray-900 hover:bg-gray-800 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-900'}`}>
                                                {isUploading ? (
                                                    <span className="flex items-center justify-center gap-2">
                                                        <svg className="animate-spin h-4 w-4 text-white" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path></svg>
                                                        Uploading...
                                                    </span>
                                                ) : 'Publish Project'}
                                            </button>
                                        </form>
                                    </div>
                                </div>

                                {/* List View */}
                                <div className="lg:col-span-2">
                                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                                        {portfolioItems.map(item => (
                                            <div key={item.id} className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden hover:shadow-md transition-shadow group flex flex-col h-full">
                                                {item.heroImage && (
                                                    <div className="h-40 w-full bg-gray-200 relative overflow-hidden">
                                                        <img src={item.heroImage.url || item.heroImage.downloadUrl || (typeof item.heroImage === 'string' ? item.heroImage : '')} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" alt={item.title} />
                                                    </div>
                                                )}
                                                <div className="p-5 flex-1 flex flex-col">
                                                    {editingPortfolio === item.id ? (
                                                        <div className="space-y-3 mb-4">
                                                            <input 
                                                                type="text" 
                                                                value={editPortfolioData.title || ''} 
                                                                onChange={e => setEditPortfolioData({...editPortfolioData, title: e.target.value})} 
                                                                className="w-full px-3 py-1 border border-gray-300 rounded text-sm focus:ring-2 focus:ring-indigo-500 outline-none"
                                                            />
                                                            <input 
                                                                type="date" 
                                                                value={editPortfolioData.date ? new Date(editPortfolioData.date).toISOString().split('T')[0] : ''} 
                                                                onChange={e => setEditPortfolioData({...editPortfolioData, date: e.target.value})} 
                                                                className="w-full px-3 py-1 border border-gray-300 rounded text-sm focus:ring-2 focus:ring-indigo-500 outline-none"
                                                            />
                                                            <div className="flex gap-2">
                                                                <button onClick={() => {
                                                                    handleUpdatePortfolio(item.id, 'title', editPortfolioData.title);
                                                                    handleUpdatePortfolio(item.id, 'date', editPortfolioData.date);
                                                                    setEditingPortfolio(null);
                                                                }} className="text-xs font-medium text-white bg-indigo-600 px-3 py-1 rounded hover:bg-indigo-700">Save</button>
                                                                <button onClick={() => setEditingPortfolio(null)} className="text-xs font-medium text-gray-600 bg-gray-100 px-3 py-1 rounded hover:bg-gray-200">Cancel</button>
                                                            </div>
                                                        </div>
                                                    ) : (
                                                        <>
                                                            <div className="flex justify-between items-start mb-2">
                                                                <h4 className="text-lg font-bold text-gray-900 line-clamp-1">{item.title}</h4>
                                                            </div>
                                                            <p className="text-sm text-gray-500 mb-4">{new Date(item.date).toLocaleDateString(undefined, { year: 'numeric', month: 'long', day: 'numeric' })}</p>
                                                        </>
                                                    )}
                                                    
                                                    <div className="mt-auto pt-4 border-t border-gray-100 flex flex-col gap-3">
                                                        <label className="flex items-center gap-2 cursor-pointer">
                                                            <input 
                                                                type="checkbox" 
                                                                checked={item.homePage || false}
                                                                onChange={(e) => handleUpdatePortfolio(item.id, 'homePage', e.target.checked)}
                                                                className="w-4 h-4 text-indigo-600 border-gray-300 rounded focus:ring-indigo-500"
                                                            />
                                                            <span className="text-sm text-gray-700 font-medium">Feature on Home Page</span>
                                                        </label>
                                                        <div className="flex flex-wrap gap-2 mt-2 pt-2 border-t border-gray-100">
                                                            <button onClick={() => {
                                                                setEditingPortfolio(item.id);
                                                                setEditPortfolioData({ title: item.title, date: item.date });
                                                            }} className="flex-1 justify-center text-xs sm:text-sm font-medium text-indigo-700 bg-indigo-50 hover:bg-indigo-100 transition-colors flex items-center gap-1 py-1.5 px-2 rounded-md">
                                                                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"></path></svg>
                                                                Edit
                                                            </button>
                                                            <button onClick={() => openReorderModal(item)} className="flex-[1.5] justify-center text-xs sm:text-sm font-medium text-teal-700 bg-teal-50 hover:bg-teal-100 transition-colors flex items-center gap-1 py-1.5 px-2 rounded-md">
                                                                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 6h16M4 12h16m-7 6h7"></path></svg>
                                                                Reorder
                                                            </button>
                                                            <button onClick={() => handleDeletePortfolio(item.id)} className="flex-1 justify-center text-xs sm:text-sm font-medium text-red-700 bg-red-50 hover:bg-red-100 transition-colors flex items-center gap-1 py-1.5 px-2 rounded-md">
                                                                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"></path></svg>
                                                                Delete
                                                            </button>
                                                        </div>
                                                    </div>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                    {portfolioItems.length === 0 && (
                                        <div className="text-center py-12 bg-white rounded-xl border border-dashed border-gray-300">
                                            <p className="text-gray-500">No portfolio items found. Create your first one!</p>
                                        </div>
                                    )}
                                </div>
                            </div>
                        </div>
                    )}

                    {/* FILMS TAB */}
                    {activeTab === 'films' && (
                        <div className="animate-fadeIn">
                            <div className="mb-8">
                                <h1 className="text-3xl font-bold text-gray-900">Wedding Films</h1>
                                <p className="text-gray-500 mt-2">Manage your video features and cinematic trailers.</p>
                            </div>
                            
                            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                                <div className="lg:col-span-1">
                                    <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 sticky top-6">
                                        <h3 className="text-xl font-semibold mb-6">Add New Film</h3>
                                        <form onSubmit={handleCreateFilm} className="space-y-5">
                                            <div>
                                                <label className="block text-sm font-medium text-gray-700 mb-1">Film Title</label>
                                                <input type="text" placeholder="e.g. A Beautiful Journey" value={newFilm.title} onChange={e => setNewFilm({...newFilm, title: e.target.value})} required className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-gray-900 focus:border-transparent outline-none transition-all" />
                                            </div>
                                            <div>
                                                <label className="block text-sm font-medium text-gray-700 mb-1">Date</label>
                                                <input type="date" value={newFilm.date} onChange={e => setNewFilm({...newFilm, date: e.target.value})} className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-gray-900 focus:border-transparent outline-none transition-all" />
                                            </div>
                                            <div>
                                                <label className="block text-sm font-medium text-gray-700 mb-1">YouTube / Vimeo URL</label>
                                                <input type="url" placeholder="https://..." value={newFilm.videoUrl} onChange={e => setNewFilm({...newFilm, videoUrl: e.target.value})} required className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-gray-900 focus:border-transparent outline-none transition-all" />
                                            </div>
                                            
                                            <div className="pt-4 border-t border-gray-100">
                                                <label className="block text-sm font-medium text-gray-700 mb-2">Custom Thumbnail</label>
                                                <div className="mt-1 flex justify-center px-6 pt-5 pb-6 border-2 border-gray-300 border-dashed rounded-lg hover:border-gray-400 transition-colors bg-gray-50">
                                                    <div className="space-y-1 text-center">
                                                        <svg className="mx-auto h-12 w-12 text-gray-400" stroke="currentColor" fill="none" viewBox="0 0 48 48"><path d="M28 8H12a4 4 0 00-4 4v20m32-12v8m0 0v8a4 4 0 01-4 4H12a4 4 0 01-4-4v-4m32-4l-3.172-3.172a4 4 0 00-5.656 0L28 28M8 32l9.172-9.172a4 4 0 015.656 0L28 28m0 0l4 4m4-24h8m-4-4v8m-12 4h.02" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" /></svg>
                                                        <div className="flex text-sm text-gray-600 justify-center">
                                                            <label className="relative cursor-pointer bg-white rounded-md font-medium text-indigo-600 hover:text-indigo-500 focus-within:outline-none px-1">
                                                                <span>Upload thumbnail</span>
                                                                <input type="file" onChange={e => setFilmThumbnail(e.target.files[0])} accept="image/*" className="sr-only" />
                                                            </label>
                                                        </div>
                                                        <p className="text-xs text-gray-500">PNG, JPG up to 5MB</p>
                                                        {filmThumbnail && <p className="text-xs font-semibold text-green-600 mt-2 truncate max-w-[200px]">{filmThumbnail.name}</p>}
                                                    </div>
                                                </div>
                                            </div>

                                            <button type="submit" disabled={isUploading} className={`w-full py-3 px-4 border border-transparent rounded-lg shadow-sm text-sm font-medium text-white transition-colors ${isUploading ? 'bg-gray-400 cursor-not-allowed' : 'bg-gray-900 hover:bg-gray-800 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-900'}`}>
                                                {isUploading ? 'Publishing...' : 'Publish Film'}
                                            </button>
                                        </form>
                                    </div>
                                </div>

                                <div className="lg:col-span-2">
                                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                                        {films.map(film => (
                                            <div key={film.id} className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden hover:shadow-md transition-shadow group flex flex-col h-full">
                                                {film.thumbnail && (
                                                    <div className="h-40 w-full bg-gray-900 relative overflow-hidden flex items-center justify-center">
                                                        <img src={film.thumbnail.downloadUrl || film.thumbnail} className="absolute inset-0 w-full h-full object-cover opacity-70 group-hover:opacity-100 transition-opacity duration-500" alt={film.title} />
                                                        <svg className="w-12 h-12 text-white z-10 opacity-80" fill="currentColor" viewBox="0 0 24 24"><path d="M8 5v14l11-7z" /></svg>
                                                    </div>
                                                )}
                                                <div className="p-5 flex-1 flex flex-col">
                                                    <h4 className="text-lg font-bold text-gray-900 line-clamp-1 mb-1">{film.title}</h4>
                                                    <p className="text-sm text-gray-500 mb-3">{new Date(film.date).toLocaleDateString()}</p>
                                                    <a href={film.videoUrl} target="_blank" rel="noreferrer" className="text-sm font-medium text-indigo-600 hover:text-indigo-800 mb-4 inline-flex items-center gap-1">
                                                        Watch on Platform 
                                                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14"></path></svg>
                                                    </a>
                                                    
                                                    <div className="mt-auto pt-4 border-t border-gray-100">
                                                        <button onClick={() => handleDeleteFilm(film.id)} className="text-sm font-medium text-red-600 hover:text-red-800 transition-colors flex items-center gap-1">
                                                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"></path></svg>
                                                            Delete Film
                                                        </button>
                                                    </div>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            </div>
                        </div>
                    )}

                    {/* MESSAGES TAB */}
                    {activeTab === 'messages' && (
                        <div className="animate-fadeIn max-w-4xl">
                            <div className="mb-8">
                                <h1 className="text-3xl font-bold text-gray-900">Contact Messages</h1>
                                <p className="text-gray-500 mt-2">Inquiries and messages from your website visitors.</p>
                            </div>
                            
                            <div className="space-y-4">
                                {messages.map(msg => (
                                    <div key={msg.id} className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 hover:shadow-md transition-shadow">
                                        <div className="flex justify-between items-start flex-wrap gap-4 mb-4">
                                            <div>
                                                <h4 className="text-lg font-bold text-gray-900 flex items-center gap-2">
                                                    {msg.name}
                                                    <span className="text-sm font-normal text-gray-500 bg-gray-100 px-2 py-1 rounded-md">{new Date(msg._createdAt).toLocaleString()}</span>
                                                </h4>
                                                <div className="flex flex-wrap gap-x-4 gap-y-1 mt-2 text-sm text-gray-600">
                                                    <a href={`mailto:${msg.email}`} className="flex items-center gap-1 hover:text-indigo-600 transition-colors">
                                                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"></path></svg>
                                                        {msg.email}
                                                    </a>
                                                    {msg.phone && (
                                                        <a href={`tel:${msg.phone}`} className="flex items-center gap-1 hover:text-indigo-600 transition-colors">
                                                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z"></path></svg>
                                                            {msg.phone}
                                                        </a>
                                                    )}
                                                </div>
                                            </div>
                                            <button onClick={() => handleDeleteMessage(msg.id)} className="text-gray-400 hover:text-red-600 transition-colors p-2 hover:bg-red-50 rounded-lg">
                                                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"></path></svg>
                                            </button>
                                        </div>
                                        {msg.subject && <h5 className="font-semibold text-gray-900 mb-2">Subject: {msg.subject}</h5>}
                                        <div className="bg-gray-50 rounded-lg p-4 text-gray-700 text-sm whitespace-pre-wrap border border-gray-100">
                                            {msg.message}
                                        </div>
                                    </div>
                                ))}
                                {messages.length === 0 && (
                                    <div className="text-center py-12 bg-white rounded-xl border border-dashed border-gray-300">
                                        <svg className="mx-auto h-12 w-12 text-gray-400 mb-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4"></path></svg>
                                        <p className="text-gray-500">Inbox is empty. No messages yet.</p>
                                    </div>
                                )}
                            </div>
                        </div>
                    )}

                    {/* SETTINGS TAB */}
                    {activeTab.startsWith('home_') && (
                        <div className="animate-fadeIn max-w-4xl">
                            <div className="mb-8">
                                <h1 className="text-3xl font-bold text-gray-900">Home Page Settings</h1>
                                <p className="text-gray-500 mt-2">Configure the layout and media for the main landing page.</p>
                            </div>
                            
                            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 lg:p-8">
                                                                                                <form onSubmit={handleUpdateSiteConfig} className="space-y-6">
                                    


                                    {/* 1. Hero Video */}
                                    {activeTab === 'home_video' && (
                                        <div className="space-y-6 animate-fadeIn">
                                            <div className="bg-gray-50 p-6 rounded-xl border border-gray-200">
                                                <h3 className="text-xl font-semibold text-gray-900 mb-1">Hero Background Video</h3>
                                                <p className="text-sm text-gray-500 mb-5">This video automatically plays in the background on your home page (converted to WebM at 1x speed).</p>
                                                
                                                {siteConfig && siteConfig.heroVideo && (
                                                    <div className="mb-6 p-4 bg-white rounded-xl border border-gray-200 shadow-sm">
                                                        <p className="text-sm font-medium text-gray-700 mb-3 flex items-center gap-2">
                                                            <svg className="w-4 h-4 text-green-500" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd"></path></svg>
                                                            Currently Active Video
                                                        </p>
                                                        <div className="rounded-lg overflow-hidden border border-gray-200 bg-black aspect-video max-w-sm">
                                                            <video src={siteConfig.heroVideo.url || siteConfig.heroVideo} className="w-full h-full object-cover" controls muted></video>
                                                        </div>
                                                    </div>
                                                )}

                                                <div className="border-2 border-dashed border-gray-300 rounded-xl p-6 text-center hover:bg-gray-100 transition-colors bg-white">
                                                    <input
                                                        type="file"
                                                        accept="video/*"
                                                        onChange={(e) => setNewHeroVideo(e.target.files[0])}
                                                        className="hidden"
                                                        id="hero-video-upload"
                                                    />
                                                    <label htmlFor="hero-video-upload" className="cursor-pointer flex flex-col items-center">
                                                        <div className="w-12 h-12 bg-gray-100 rounded-full flex items-center justify-center mb-3 text-gray-500">
                                                            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z"></path></svg>
                                                        </div>
                                                        <span className="text-gray-900 font-medium">Select new video</span>
                                                        <span className="text-xs text-gray-400 mt-1">MP4, MOV, or WebM (auto-converts to optimized WebM)</span>
                                                    </label>
                                                    {newHeroVideo && (
                                                        <p className="mt-3 text-sm font-medium text-green-600">Selected: {newHeroVideo.name}</p>
                                                    )}
                                                </div>
                                            </div>

                                            {/* Hero Video Thumbnail / Poster Card */}
                                            <div className="bg-gray-50 p-6 rounded-xl border border-gray-200">
                                                <h3 className="text-xl font-semibold text-gray-900 mb-1">Hero Poster Thumbnail</h3>
                                                <p className="text-sm text-gray-500 mb-5">Renders immediately on initial load while the video buffers, preventing black or blank screens.</p>

                                                {siteConfig && siteConfig.heroVideoThumb && (
                                                    <div className="mb-6 p-4 bg-white rounded-xl border border-gray-200 shadow-sm">
                                                        <p className="text-sm font-medium text-gray-700 mb-3 flex items-center gap-2">
                                                            <svg className="w-4 h-4 text-green-500" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd"></path></svg>
                                                            Currently Active Poster
                                                        </p>
                                                        <div className="rounded-lg overflow-hidden border border-gray-200 aspect-video max-w-sm bg-gray-100">
                                                            <img src={siteConfig.heroVideoThumb.url || siteConfig.heroVideoThumb} alt="Hero Poster" className="w-full h-full object-cover" />
                                                        </div>
                                                    </div>
                                                )}

                                                <div className="border-2 border-dashed border-gray-300 rounded-xl p-6 text-center hover:bg-gray-100 transition-colors bg-white">
                                                    <input
                                                        type="file"
                                                        accept="image/*"
                                                        onChange={(e) => setNewHeroVideoThumb(e.target.files[0])}
                                                        className="hidden"
                                                        id="hero-thumb-upload"
                                                    />
                                                    <label htmlFor="hero-thumb-upload" className="cursor-pointer flex flex-col items-center">
                                                        <div className="w-12 h-12 bg-gray-100 rounded-full flex items-center justify-center mb-3 text-gray-500">
                                                            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"></path></svg>
                                                        </div>
                                                        <span className="text-gray-900 font-medium">Select poster image</span>
                                                        <span className="text-xs text-gray-400 mt-1">JPG, PNG, or WebP (auto-converts to WebP)</span>
                                                    </label>
                                                    {newHeroVideoThumb && (
                                                        <p className="mt-3 text-sm font-medium text-green-600">Selected: {newHeroVideoThumb.name}</p>
                                                    )}
                                                </div>
                                            </div>
                                        </div>
                                    )}

                                    {/* 2. Image Folio */}
                                    {activeTab === 'home_folio' && (
                                        <div className="bg-gray-50 p-6 rounded-xl border border-gray-200 animate-fadeIn space-y-6">
                                            <div className="flex justify-between items-center">
                                                <div>
                                                    <h3 className="text-xl font-semibold text-gray-900">Image Folio (Mosaic Grid)</h3>
                                                    <p className="text-sm text-gray-500 mt-0.5">Drag to rearrange order or click delete to remove an image. Save to apply your changes.</p>
                                                </div>
                                                <div className="flex items-center gap-2">
                                                    <button
                                                        type="button"
                                                        onClick={() => refreshSiteConfig(true)}
                                                        className="text-xs text-indigo-600 hover:text-indigo-800 bg-indigo-50 hover:bg-indigo-100 px-2.5 py-1 rounded-md font-medium flex items-center gap-1 transition-colors"
                                                        title="Refresh image links from server"
                                                    >
                                                        <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"></path></svg>
                                                        Refresh Links
                                                    </button>
                                                    {managedFolioImages.length > 0 && (
                                                        <span className="text-xs font-bold bg-indigo-100 text-indigo-700 px-3 py-1 rounded-full">
                                                            {managedFolioImages.length} Images
                                                        </span>
                                                    )}
                                                </div>
                                            </div>
                                            
                                            {/* Unsaved changes banner for folio */}
                                            {isFolioDirty && (
                                                <div className="p-4 bg-amber-50 border border-amber-300 rounded-xl flex items-center justify-between">
                                                    <div className="flex items-center gap-2 text-amber-800 text-sm font-medium">
                                                        <svg className="w-5 h-5 text-amber-600" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"></path></svg>
                                                        You have unsaved folio order/removal changes.
                                                    </div>
                                                    <button
                                                        type="button"
                                                        onClick={handleSaveFolioChanges}
                                                        disabled={isUploading}
                                                        className="px-4 py-2 bg-amber-600 hover:bg-amber-700 text-white rounded-lg text-sm font-semibold shadow-sm transition-colors"
                                                    >
                                                        Save Folio Order Now
                                                    </button>
                                                </div>
                                            )}

                                            {/* Interactive Drag & Drop / Delete Folio Grid */}
                                            {managedFolioImages.length > 0 ? (
                                                <div className="p-4 bg-white rounded-xl border border-gray-200 shadow-sm">
                                                    <div className="flex justify-between items-center mb-3">
                                                        <p className="text-sm font-medium text-gray-700 flex items-center gap-2">
                                                            <svg className="w-4 h-4 text-indigo-600" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 6h16M4 12h16M4 18h16"></path></svg>
                                                            Current Order (Drag cards to reorder, click trash to delete)
                                                        </p>
                                                    </div>
                                                    <div className="grid grid-cols-2 sm:grid-cols-4 md:grid-cols-6 lg:grid-cols-8 gap-3">
                                                        {managedFolioImages.map((img, idx) => (
                                                            <div 
                                                                key={img.id || idx} 
                                                                draggable
                                                                onDragStart={(e) => handleFolioDragStart(e, idx)}
                                                                onDragOver={(e) => e.preventDefault()}
                                                                onDrop={(e) => handleFolioDrop(e, idx)}
                                                                className="group relative aspect-square rounded-lg overflow-hidden bg-gray-100 border-2 border-gray-200 hover:border-indigo-500 cursor-grab active:cursor-grabbing transition-all shadow-sm hover:shadow"
                                                                title="Drag to reorder"
                                                            >
                                                                <img 
                                                                    src={img.url || img.downloadUrl} 
                                                                    alt="" 
                                                                    className="w-full h-full object-cover pointer-events-none" 
                                                                    onError={(e) => {
                                                                        if (!e.target.dataset.retried) {
                                                                            e.target.dataset.retried = "true";
                                                                            refreshSiteConfig();
                                                                        }
                                                                    }}
                                                                />
                                                                {/* Index Badge */}
                                                                <span className="absolute top-1 left-1 bg-black/70 text-white text-[10px] font-bold px-1.5 py-0.5 rounded backdrop-blur-sm pointer-events-none">
                                                                    #{idx + 1}
                                                                </span>
                                                                {/* Delete Button */}
                                                                <button
                                                                    type="button"
                                                                    onClick={(e) => {
                                                                        e.stopPropagation();
                                                                        handleDeleteFolioImage(idx);
                                                                    }}
                                                                    className="absolute top-1 right-1 p-1 bg-red-600/90 text-white rounded hover:bg-red-700 transition-opacity opacity-0 group-hover:opacity-100 shadow"
                                                                    title="Remove image from folio"
                                                                >
                                                                    <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"></path></svg>
                                                                </button>
                                                            </div>
                                                        ))}
                                                    </div>
                                                </div>
                                            ) : (
                                                <div className="p-8 bg-white rounded-xl border border-dashed border-gray-300 text-center text-gray-400">
                                                    No folio images currently in gallery. Add images below.
                                                </div>
                                            )}

                                            {/* Add New Images Section */}
                                            <div className="bg-white p-5 rounded-xl border border-gray-200">
                                                <h4 className="text-sm font-semibold text-gray-800 mb-2">Add New Images to Folio</h4>
                                                <p className="text-xs text-gray-500 mb-4">Selected images will automatically be converted to WebP and appended to the existing gallery.</p>
                                                <div className="border-2 border-dashed border-gray-300 rounded-xl p-6 text-center hover:bg-gray-50 transition-colors">
                                                    <input
                                                        type="file"
                                                        accept="image/*"
                                                        multiple
                                                        onChange={(e) => setNewFolioImages(Array.from(e.target.files))}
                                                        className="hidden"
                                                        id="folio-upload"
                                                    />
                                                    <label htmlFor="folio-upload" className="cursor-pointer flex flex-col items-center">
                                                        <div className="w-10 h-10 bg-indigo-50 text-indigo-600 rounded-full flex items-center justify-center mb-2">
                                                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4v16m8-8H4"></path></svg>
                                                        </div>
                                                        <span className="text-gray-900 font-medium text-sm">Select Images to Add</span>
                                                        <span className="text-xs text-gray-400 mt-1">Converts to WebP before upload</span>
                                                    </label>
                                                    {newFolioImages.length > 0 && (
                                                        <p className="mt-3 text-sm font-medium text-green-600 font-semibold">{newFolioImages.length} images selected ready to upload & add</p>
                                                    )}
                                                </div>
                                            </div>
                                        </div>
                                    )}

                                    {/* 3. Team Images */}
                                    {activeTab === 'home_team' && (
                                        <div className="bg-gray-50 p-6 rounded-xl border border-gray-200 animate-fadeIn">
                                            <div className="flex justify-between items-center mb-1">
                                                <h3 className="text-xl font-semibold text-gray-900">Team Portraits (About Us)</h3>
                                                {siteConfig?.teamImages && (
                                                    <span className="text-xs font-bold bg-indigo-100 text-indigo-700 px-2 py-1 rounded">
                                                        {siteConfig.teamImages.length} Active in Database
                                                    </span>
                                                )}
                                            </div>
                                            <p className="text-sm text-gray-500 mb-5">Upload team member portraits for the 4x2 About Us grid (Max 8 recommended). Re-uploading will replace the current set.</p>
                                            
                                            {/* Preview of active team portraits */}
                                            {siteConfig && Array.isArray(siteConfig.teamImages) && siteConfig.teamImages.length > 0 && (
                                                <div className="mb-6 p-4 bg-white rounded-xl border border-gray-200 shadow-sm">
                                                    <p className="text-sm font-medium text-gray-700 mb-3 flex items-center gap-2">
                                                        <svg className="w-4 h-4 text-green-500" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd"></path></svg>
                                                        Currently Active Portraits ({siteConfig.teamImages.length})
                                                    </p>
                                                    <div className="grid grid-cols-4 sm:grid-cols-6 md:grid-cols-8 gap-2">
                                                        {siteConfig.teamImages.map((img, idx) => (
                                                            <div key={img.id || idx} className="aspect-square rounded-md overflow-hidden bg-gray-100 border border-gray-200">
                                                                <img src={img.url || img.downloadUrl} alt="" className="w-full h-full object-cover" />
                                                            </div>
                                                        ))}
                                                    </div>
                                                </div>
                                            )}

                                            <div className="border-2 border-dashed border-gray-300 rounded-xl p-6 text-center hover:bg-gray-100 transition-colors bg-white">
                                                <input
                                                    type="file"
                                                    accept="image/*"
                                                    multiple
                                                    onChange={(e) => setNewTeamImages(Array.from(e.target.files))}
                                                    className="hidden"
                                                    id="team-upload"
                                                />
                                                <label htmlFor="team-upload" className="cursor-pointer flex flex-col items-center">
                                                    <div className="w-12 h-12 bg-gray-100 rounded-full flex items-center justify-center mb-3 text-gray-500">
                                                        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z"></path></svg>
                                                    </div>
                                                    <span className="text-gray-900 font-medium">Select Team Portraits</span>
                                                </label>
                                                {newTeamImages.length > 0 && (
                                                    <p className="mt-3 text-sm font-medium text-green-600 font-semibold">{newTeamImages.length} portraits selected ready to save</p>
                                                )}
                                            </div>
                                        </div>
                                    )}

                                    <div className="pt-6 border-t border-gray-200 flex justify-end">
                                        <button 
                                            type="submit" 
                                            disabled={isUploading || (
                                                activeTab === 'home_video' ? (!newHeroVideo && !newHeroVideoThumb) :
                                                activeTab === 'home_folio' ? newFolioImages.length === 0 :
                                                activeTab === 'home_team' ? newTeamImages.length === 0 : true
                                            )} 
                                            className={`py-3 px-8 rounded-lg shadow-sm font-bold text-white transition-colors ${(
                                                isUploading || (
                                                    activeTab === 'home_video' ? (!newHeroVideo && !newHeroVideoThumb) :
                                                    activeTab === 'home_folio' ? newFolioImages.length === 0 :
                                                    activeTab === 'home_team' ? newTeamImages.length === 0 : true
                                                )
                                            ) ? 'bg-gray-400 cursor-not-allowed' : 'bg-gray-900 hover:bg-gray-800'}`}
                                        >
                                            {isUploading ? 'Uploading & Saving...' : 'Save Current Section'}
                                        </button>
                                    </div>
                                </form>
                            </div>
                        </div>
                    )}
                </div>
            </main>


            {/* Bulk Selection Modal */}
            {pendingSelectionImages && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4">
                    <div className="bg-white rounded-xl shadow-xl w-full max-w-5xl flex flex-col max-h-[90vh]">
                        <div className="p-5 border-b">
                            <div className="flex justify-between items-center mb-2">
                                <h3 className="text-xl font-bold">Select Images (Max 100)</h3>
                                <button onClick={() => {
                                    setPendingSelectionImages(null);
                                    setSelectedSelectionIndices(new Set());
                                }} className="text-gray-400 hover:text-gray-600">
                                    <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" /></svg>
                                </button>
                            </div>
                            <p className="text-sm text-gray-500">
                                You dropped {pendingSelectionImages.length} images, but the gallery is limited to 100 total images.
                                You currently have {portfolioImages.length} images already in the gallery.
                                Please select up to {100 - portfolioImages.length} images to import.
                            </p>
                            <div className="mt-3 flex justify-between items-center bg-gray-50 p-3 rounded-lg border">
                                <span className="text-sm font-medium">Selected: {selectedSelectionIndices.size} / {100 - portfolioImages.length}</span>
                                <div className="space-x-3">
                                    <button 
                                        onClick={() => setSelectedSelectionIndices(new Set())}
                                        className="text-sm text-gray-600 hover:text-gray-900"
                                    >
                                        Clear All
                                    </button>
                                </div>
                            </div>
                        </div>
                        <div className="p-5 overflow-y-auto flex-1 bg-gray-100">
                            <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 lg:grid-cols-6 xl:grid-cols-8 gap-3">
                                {pendingSelectionImages.map((img, index) => (
                                    <SelectionThumbnail 
                                        key={index}
                                        item={img}
                                        index={index}
                                        isSelected={selectedSelectionIndices.has(index)}
                                        disabled={selectedSelectionIndices.size >= (100 - portfolioImages.length)}
                                        onToggle={(idx) => {
                                            setSelectedSelectionIndices(prev => {
                                                const next = new Set(prev);
                                                if (next.has(idx)) next.delete(idx);
                                                else next.add(idx);
                                                return next;
                                            });
                                        }}
                                    />
                                ))}
                            </div>
                        </div>
                        <div className="p-5 border-t bg-white flex justify-end gap-3">
                            <button 
                                onClick={() => {
                                    setPendingSelectionImages(null);
                                    setSelectedSelectionIndices(new Set());
                                }}
                                className="px-4 py-2 border border-gray-300 rounded-lg text-sm font-medium text-gray-700 hover:bg-gray-50"
                            >
                                Cancel Import
                            </button>
                            <button 
                                onClick={confirmImageSelection}
                                disabled={selectedSelectionIndices.size === 0}
                                className={`px-4 py-2 border border-transparent rounded-lg shadow-sm text-sm font-medium text-white transition-colors ${selectedSelectionIndices.size === 0 ? 'bg-indigo-400 cursor-not-allowed' : 'bg-indigo-600 hover:bg-indigo-700'}`}
                            >
                                Confirm Selection ({selectedSelectionIndices.size})
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* Reorder Images Modal */}
            {reorderingItem && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4">
                    <div className="bg-white rounded-xl shadow-xl w-full max-w-4xl flex flex-col max-h-[90vh]">
                        <div className="p-5 border-b flex justify-between items-center">
                            <h3 className="text-xl font-bold">Reorder Images: {reorderingItem.title}</h3>
                            <button onClick={() => setReorderingItem(null)} className="text-gray-400 hover:text-gray-600">
                                <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" /></svg>
                            </button>
                        </div>
                        <div className="p-5 overflow-y-auto flex-1 bg-gray-50">
                            <p className="text-sm text-gray-500 mb-4">Drag and drop images to reorder them.</p>
                            {reorderImages.length === 0 ? (
                                <p className="text-center text-gray-500 py-10">No images found for this project.</p>
                            ) : (
                                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
                                    {reorderImages.map((img, index) => (
                                        <div 
                                            key={img.id}
                                            draggable
                                            onDragStart={(e) => handleReorderDragStart(e, index)}
                                            onDragOver={(e) => e.preventDefault()}
                                            onDrop={(e) => handleReorderDrop(e, index)}
                                            className="relative aspect-square rounded-lg overflow-hidden border-2 border-transparent hover:border-indigo-400 cursor-move bg-gray-200 shadow-sm transition-colors group"
                                        >
                                            <img 
                                                src={img.downloadUrl || img.url || ''} 
                                                alt={`Image ${index + 1}`} 
                                                className="w-full h-full object-cover pointer-events-none"
                                            />
                                            <div className="absolute top-2 left-2 bg-black/60 text-white text-xs px-2 py-1 rounded font-bold">
                                                {index + 1}
                                            </div>
                                            {img.filename && (
                                                <div className="absolute bottom-0 left-0 right-0 bg-black/60 text-white text-[10px] truncate px-2 py-1">
                                                    {img.filename}
                                                </div>
                                            )}
                                            <div className="absolute inset-0 bg-black/0 group-hover:bg-black/10 pointer-events-none transition-colors" />
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>
                        <div className="p-5 border-t bg-white flex justify-end gap-3">
                            <button 
                                onClick={() => setReorderingItem(null)}
                                className="px-4 py-2 border border-gray-300 rounded-lg text-sm font-medium text-gray-700 hover:bg-gray-50"
                            >
                                Cancel
                            </button>
                            <button 
                                onClick={saveReorderedImages}
                                disabled={isSavingOrder}
                                className={`px-4 py-2 border border-transparent rounded-lg shadow-sm text-sm font-medium text-white transition-colors ${isSavingOrder ? 'bg-indigo-400 cursor-not-allowed' : 'bg-indigo-600 hover:bg-indigo-700'}`}
                            >
                                {isSavingOrder ? 'Saving...' : 'Save Order'}
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default AdminDashboard;
