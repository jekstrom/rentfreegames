import React, { useRef, useState } from "react";
import Layout from '../../components/layout'
import { useSession, signIn, signOut } from "next-auth/react"
import { useGuestUserContext } from '../../components/GuestUserContext';
import Signin from '../../components/signin';
import { Button } from '@mui/material';
import DeleteIcon from '@mui/icons-material/Delete';
import UploadIcon from '@mui/icons-material/Upload';
import AvatarEditor from 'react-avatar-editor'
import { ResponseError, User } from "../../interfaces";
import useSWR, { useSWRConfig } from 'swr';

const deleteData = async (url: string, data: any) => {
    const response = await fetch(url, {
        method: 'DELETE',
        mode: 'cors',
        body: JSON.stringify(data)
    });

    const json = await response.json();
    return json
}

const fetcher = (url: string) => fetch(url).then((res) => res.json())

const postData = async (url: string, data: any) => {
    const body = new FormData();
    body.append("file", data)
    const response = await fetch(url, {
        method: 'POST',
        mode: 'cors',
        body: body
    });

    const json = await response.json();
    return json
}

export const getUserMetaData = (guestUserId?: string) => {
    let url = `/api/users/meta`
    if (url && guestUserId) {
        url += `?guestId=${guestUserId}`;
    }

    const { data, error, isLoading, isValidating } = useSWR<
        { user: User },
        ResponseError
    >(() => url, fetcher)

    return {
        data,
        isLoading,
        error,
        isValidating,
        url
    }
}

export default function UserProfile() {
    const { data: session, status } = useSession()
    const userEmail = session?.user.email
    const guestUser = useGuestUserContext();

    const [selectedImage, setSelectedImage] = useState(null);
    const [showSizeWarning, setShowSizeWarning] = useState(false);
    const editor = useRef(null);
    const { mutate } = useSWRConfig()

    const { data, isLoading, error, isValidating, url } = getUserMetaData(guestUser?.id);

    if (status === "loading" || isLoading) {
        return <Layout><div style={{ display: "flex", justifyContent: "center" }}><img src="/images/Rentfreeanim.gif" /></div></Layout>
    }

    const deleteUserGames = async () => {
        const response = await deleteData("/api/usergames/all", { guestId: guestUser?.id });
        console.log("response: ", response);
    }

    const saveCroppedImage = async () => {
        if (editor) {
            const canvas = editor.current.getImage();
            canvas.toBlob(async (blob) => {
                console.log("blobSize: ", blob.size);
                if (blob.size < 3145728) {
                    setShowSizeWarning(false);
                    await postData("/api/users/avatar", blob).then(async (response) => {
                        let url = `/api/users/meta`
                        if (url && guestUser?.id) {
                            url += `?guestId=${guestUser?.id}`;
                        }
                        await mutate(url, {
                            ...data,
                            user: {...data.user, image: response.imageUrl}
                        }, { revalidate: true });
                    });
                } else {
                    setShowSizeWarning(true);
                }
            })
        }
    }


    if (status === "authenticated" || guestUser?.name !== "") {
        return (
            <Layout>
                <>
                    <p>Signed in as {userEmail ?? guestUser?.name}</p>
                    <Signin />
                    <br />
                    {
                        showSizeWarning && (
                            <p style={{ color: "red" }}>Image size is too large. Please upload an image less than 3MB.</p>
                        )
                    }
                    {selectedImage && (
                        <div>
                        <AvatarEditor
                            image={URL.createObjectURL(selectedImage as any)}
                            ref={editor}
                            width={128}
                            height={128}
                            border={20}
                            borderRadius={128}
                            color={[1, 20, 30, 0.7]} // RGBA
                            scale={1.5}
                            rotate={0}
                        />
                            <Button variant="contained" onClick={() => {setSelectedImage(null); setShowSizeWarning(false);}}>Remove</Button>
                            <br/>
                            { !showSizeWarning && <Button variant="contained" onClick={saveCroppedImage}>Save</Button> }
                        </div>
                    )}
                    <br />
                    <input
                        accept="image/*"
                        style={{ display: 'none' }}
                        id="raised-button-file"
                        multiple
                        type="file"
                        onChange={(e) => {
                            if (e.target.files) {
                                setSelectedImage(e.target.files[0] as any);
                                if (e.target.files[0].size > 3145728) {
                                    setShowSizeWarning(true);
                                } else {
                                    setShowSizeWarning(false);
                                }
                            }
                        }}
                        />
                        <label htmlFor="raised-button-file">
                        <Button 
                            variant="contained" 
                            sx={{ bgcolor: "secondary.main", color: "secondary.contrastText", height: "100%" }} 
                            endIcon={<UploadIcon sx={{ color: "secondary.light" }} />}
                            component="span">
                            Upload avatar image
                        </Button>
                        </label> 
                    <br />
                    <br />
                    <Button variant="contained" endIcon={<DeleteIcon sx={{ color: "secondary.light" }} />} onClick={() => deleteUserGames()} sx={{ bgcolor: "secondary.main", color: "secondary.contrastText", height: "100%" }}>
                        Reset game collection
                    </Button>
                    <br />
                </>
            </Layout>
        )
    }

    return (
        <Layout>
            <>
                <Signin />
            </>
        </Layout>
    )
}
