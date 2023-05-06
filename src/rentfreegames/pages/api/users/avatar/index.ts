import { NextApiRequest, NextApiResponse } from 'next'
import { getServerSession } from "next-auth/next"
import { authOptions } from '../../auth/[...nextauth]'
import { getGuestUserData, getUserData, addAvatar, uploadImage } from '../../../../lib/users'
import { User } from '../../../../interfaces';
import formidable from 'formidable';

const accountName = process.env.AZURE_STORAGE_ACCOUNT_NAME as string;

function cleanUser(user: User) {
    if (!user) {
        return user;
      }
    (user as any).email = null;
    (user as any).sub = null;
    delete user.sub;
    delete (user as any).email;
    return user;
}

const  form = formidable({ multiples: false }); // multiples means req.files will be an array

export default async (req: NextApiRequest, res: NextApiResponse) => {
    const userSession = await getServerSession(req, res, authOptions);

    let userData = null as User;
    userData = cleanUser(await getUserData(userSession?.user?.email));

    const { query } = req
    const { guestId } = query

    if (!userData) {
        userData = await getGuestUserData(guestId as string);
    }
    if (!userData) {
        res.status(401).json({ message: "No user." });
        return;
    }
    const blobName = `${userData.id}_avatar_blob.png`;

    if (req.method === 'POST') {
        const payload = req.body;

        const contentType = req.headers['content-type']
        if (contentType && contentType.indexOf('multipart/form-data') !== -1) {
            form.parse(req, async (err, fields, file) => {
                if (!err) {
                    console.log("files: ", file)
                    if (file.file.size < 3145728) {
                        const blob = await uploadImage(file.file, userData.id);

                        const response = await addAvatar(userData.id, blob);
                        console.log("response: ", response);
                    }
                }
            });
        }
    }

    return res.json({
        message: 'Success',
        imageUrl: `https://${accountName}.blob.core.windows.net/content/${blobName}`
    });
}

export const config = {
    api: {
      bodyParser: false,
    },
  };
