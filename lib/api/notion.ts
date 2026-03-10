export async function exportVideoLink(params: {
    pageName: string;
    videoUrl: string;
  }) {
    const res = await fetch('/api/notion/video-link', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(params)
    });
  
    if (!res.ok) {
      throw new Error('Export Notion échoué');
    }
  
    return res.json();
  }
  