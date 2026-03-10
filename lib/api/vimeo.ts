export async function uploadVideo(file: File): Promise<{
    video_url: string;
    video_id: string;
  }> {
    const formData = new FormData();
    formData.append('file', file);
  
    const res = await fetch('/api/vimeo/upload', {
      method: 'POST',
      body: formData
    });
  
    if (!res.ok) {
      const err = await res.text();
      throw new Error(err || 'Upload Vimeo échoué');
    }
  
    return res.json();
  }
  