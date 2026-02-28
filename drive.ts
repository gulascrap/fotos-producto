import { google } from 'googleapis';
import { Readable } from 'stream';

function getAuth() {
  const privateKey = process.env.GOOGLE_PRIVATE_KEY?.replace(/\\n/g, '\n');
  
  return new google.auth.GoogleAuth({
    credentials: {
      client_email: process.env.GOOGLE_SERVICE_ACCOUNT_EMAIL,
      private_key: privateKey,
    },
    scopes: ['https://www.googleapis.com/auth/drive.file'],
  });
}

export async function uploadImageToDrive(
  imageBase64: string,
  fileName: string,
  folderId: string
): Promise<{ id: string; webViewLink: string; webContentLink: string }> {
  const auth = getAuth();
  const drive = google.drive({ version: 'v3', auth });

  // Convert base64 to buffer
  const buffer = Buffer.from(imageBase64, 'base64');
  const stream = Readable.from(buffer);

  const response = await drive.files.create({
    requestBody: {
      name: fileName,
      parents: [folderId],
      mimeType: 'image/jpeg',
    },
    media: {
      mimeType: 'image/jpeg',
      body: stream,
    },
    fields: 'id,webViewLink,webContentLink',
  });

  // Make the file publicly viewable
  await drive.permissions.create({
    fileId: response.data.id!,
    requestBody: {
      role: 'reader',
      type: 'anyone',
    },
  });

  return {
    id: response.data.id!,
    webViewLink: response.data.webViewLink!,
    webContentLink: `https://drive.google.com/uc?export=download&id=${response.data.id}`,
  };
}

export async function createDriveFolder(name: string, parentFolderId: string): Promise<string> {
  const auth = getAuth();
  const drive = google.drive({ version: 'v3', auth });

  const response = await drive.files.create({
    requestBody: {
      name,
      mimeType: 'application/vnd.google-apps.folder',
      parents: [parentFolderId],
    },
    fields: 'id',
  });

  return response.data.id!;
}
