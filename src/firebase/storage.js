import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import { storage } from './config';

export async function uploadCourseFile(courseId, file, onProgressNote) {
  const safeName = file.name.replace(/[^a-zA-Z0-9._-]/g, '_');
  const path = `content/${courseId}/${Date.now()}_${safeName}`;
  const fileRef = ref(storage, path);
  onProgressNote?.('Uploading...');
  await uploadBytes(fileRef, file);
  const url = await getDownloadURL(fileRef);
  return { url, path };
}
