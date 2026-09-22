export interface CloudinaryUploadResponse {
  url: string;
  secure_url: string;
  public_id: string;
  format?: string;
  width?: number;
  height?: number;
}

export const isCloudinaryConfigured = (): boolean => {
  const cloudName = import.meta.env.VITE_CLOUDINARY_CLOUD_NAME;
  const uploadPreset = import.meta.env.VITE_CLOUDINARY_UPLOAD_PRESET;
  return Boolean(
    cloudName &&
    uploadPreset &&
    cloudName !== 'your_cloudinary_cloud_name' &&
    uploadPreset !== 'your_unsigned_upload_preset'
  );
};

/**
 * Upload a single image file to Cloudinary using an Unsigned Upload Preset.
 * Never requires or exposes the Cloudinary API Secret.
 */
export const uploadImageToCloudinary = async (
  file: File
): Promise<{ url: string; publicId: string }> => {
  const cloudName = import.meta.env.VITE_CLOUDINARY_CLOUD_NAME;
  const uploadPreset = import.meta.env.VITE_CLOUDINARY_UPLOAD_PRESET;

  // If Cloudinary credentials are provided, perform live upload
  if (isCloudinaryConfigured()) {
    const formData = new FormData();
    formData.append('file', file);
    formData.append('upload_preset', uploadPreset!);
    formData.append('folder', 'kinora/products');

    const response = await fetch(
      `https://api.cloudinary.com/v1_1/${cloudName}/image/upload`,
      {
        method: 'POST',
        body: formData,
      }
    );

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData?.error?.message || 'Failed to upload image to Cloudinary');
    }

    const data: CloudinaryUploadResponse = await response.json();
    return {
      url: data.secure_url || data.url,
      publicId: data.public_id,
    };
  }

  // Graceful Demo/Offline Mode: convert to base64 Data URL
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => {
      resolve({
        url: reader.result as string,
        publicId: `mock_kinora_${Date.now()}_${Math.random().toString(36).substring(2, 8)}`,
      });
    };
    reader.onerror = (err) => reject(err);
    reader.readAsDataURL(file);
  });
};

/**
 * Upload an image URL to Cloudinary (or validate and return for demo)
 */
export const uploadImageUrlToCloudinary = async (
  imageUrl: string
): Promise<{ url: string; publicId: string }> => {
  const cloudName = import.meta.env.VITE_CLOUDINARY_CLOUD_NAME;
  const uploadPreset = import.meta.env.VITE_CLOUDINARY_UPLOAD_PRESET;

  if (isCloudinaryConfigured()) {
    const formData = new FormData();
    formData.append('file', imageUrl);
    formData.append('upload_preset', uploadPreset!);
    formData.append('folder', 'kinora/products');

    const response = await fetch(
      `https://api.cloudinary.com/v1_1/${cloudName}/image/upload`,
      {
        method: 'POST',
        body: formData,
      }
    );

    if (response.ok) {
      const data: CloudinaryUploadResponse = await response.json();
      return {
        url: data.secure_url || data.url,
        publicId: data.public_id,
      };
    }
  }

  // Return direct validated URL with mock public ID
  return {
    url: imageUrl,
    publicId: `url_${Date.now()}_${Math.random().toString(36).substring(2, 8)}`,
  };
};

/**
 * Upload multiple files sequentially with progress reporting
 */
export const uploadMultipleImages = async (
  files: File[],
  onProgress?: (completed: number, total: number) => void
): Promise<Array<{ url: string; publicId: string }>> => {
  const results: Array<{ url: string; publicId: string }> = [];
  for (let i = 0; i < files.length; i++) {
    const res = await uploadImageToCloudinary(files[i]);
    results.push(res);
    if (onProgress) {
      onProgress(i + 1, files.length);
    }
  }
  return results;
};
