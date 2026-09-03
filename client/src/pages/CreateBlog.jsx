import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import ReactQuill from 'react-quill';
import 'react-quill/dist/quill.snow.css';
import { getDownloadURL, ref, uploadBytes } from 'firebase/storage';
import { firebaseStorage } from '../firebase/firebaseConfig';
import { addBlogStart, addBlogFailure, addBlogSuccess } from '../features/blogSlice';
import FirebaseLoader from '../assests/firebaseLoader/FirebaseLoader';
import toast, { Toaster } from 'react-hot-toast';
import axios from 'axios';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';








const CreateBlog = () => {

    const { user } = useSelector((state) => state.userSliceApp);
    const { theme } = useSelector((state) => state.themeSliceApp);
    const navigate = useNavigate();
    const dispatch = useDispatch();

    const [blogImage, setBlogImage] = useState(null);
    const [firebaseBlogImgUrl, setFirebaseBlogImgUrl] = useState(null);

    const [formData, setFormData] = useState({
        user: user
    });

    const [imageLoader, setImageLoader] = useState(false);
    const quillRef = useRef(null);

    const imageHandler = useCallback(() => {
        const input = document.createElement('input');
        input.setAttribute('type', 'file');
        input.setAttribute('accept', 'image/*');
        input.click();

        input.onchange = async () => {
            const file = input.files[0];
            if (!file) return;

            const quill = quillRef.current?.getEditor();
            const range = quill?.getSelection(true);

            try {
                const uniqueImageId = `inline_image_${Date.now().toString()}`;
                const imageRef = ref(firebaseStorage, `blogImages/${uniqueImageId}`);

                toast.loading('Uploading image...', { id: 'inline-img-upload' });

                const upload = await uploadBytes(imageRef, file);
                const imageUrl = await getDownloadURL(upload.ref);

                quill.insertEmbed(range?.index ?? 0, 'image', imageUrl);
                quill.setSelection((range?.index ?? 0) + 1);

                toast.success('Image inserted', { id: 'inline-img-upload' });
            } catch (error) {
                toast.error('Failed to upload image', { id: 'inline-img-upload' });
                console.log(error.message);
            }
        };
    }, []);

    const quillModules = useMemo(
        () => ({
            toolbar: {
                container: [
                    [{ header: [1, 2, 3, false] }],
                    ['bold', 'italic', 'underline', 'strike'],
                    ['blockquote', 'code-block'],
                    [{ list: 'ordered' }, { list: 'bullet' }],
                    ['link', 'image'],
                    ['clean'],
                ],
                handlers: {
                    image: imageHandler,
                },
            },
        }),
        [imageHandler]
    );

    const quillFormats = useMemo(
        () => [
            'header',
            'bold',
            'italic',
            'underline',
            'strike',
            'blockquote',
            'code-block',
            'list',
            'bullet',
            'link',
            'image',
        ],
        []
    );





    const blogImgChangeHandle = (e) => {
        const file = e.target.files[0];
        setBlogImage(file);
    };


    // Firebase Blog image upload : 


    useEffect(() => {

    }, [firebaseBlogImgUrl]);

    const firebaseUploadImg = async () => {

        if (!blogImage) {
            toast.error('Select an image !');
            return false;
        }

        const uniqueImageId = `image_ ${Date.now().toString()}`

        const imageRef = ref(firebaseStorage, `blogImages/${uniqueImageId}`, blogImage);

        try {
            setImageLoader(true);

            const upload = await uploadBytes(imageRef, blogImage);

            const blogImgUrl = await getDownloadURL(upload.ref);
            setImageLoader(false)
            toast.success('Image uploaded successfully');

            setFirebaseBlogImgUrl(blogImgUrl);
            setFormData({
                ...formData, blogImgFile: blogImgUrl
            })


        } catch (error) {
            setImageLoader(false);
            console.log('Could not upload image');
        }
    }




    const inputChangeHandle = (e) => {
        const { name, value } = e.target;
        setFormData({
            ...formData, [name]: value
        })
    }


    const reactQuillChange = (e) => {
        const blogBody = e;
        setFormData({
            ...formData, blogBody
        })
    }


    const publishBlogBtn = (e) => {
        e.preventDefault();
        validateForm(formData)
    }



    const validateForm = async (formInfo) => {

        // Blog Title Validation:
        if (!formInfo.blogTitle) {
            toast.error('Blog title is required!');
            return false
        }

        // Post body validation : 
        if (!formData.blogBody) {
            toast.error('Post body can not be empty!')
            return false;
        } else if (formData.blogBody.length < 20) {
            toast.error('Post body can be less than 20 char!');
            return false;
        } else {

            try {

                dispatch(addBlogStart());
                const addBlog = await axios.post(`/api/blog/post-blog`, formData, {
                    headers: {
                        Authorization: user.token,
                    },
                })
                if (addBlog.status === 200) {

                    const response = addBlog.data.blog;
                    dispatch(addBlogSuccess(response));
                    navigate(`/blog/${response.slug}`);
                }
            } catch (error) {
                dispatch(addBlogFailure(error));
                console.log(error);
            }
        }
    }



    return (
        <>
            <div className="min-h-screen flex w-full  items-center flex-col">

                <h1 className="text-3xl py-5 text-violet-500 font-semibold">Create Blog</h1>

                <form action="" className="flex flex-col w-10/12 gap-5">

                    <div className="flex gap-5">

                        <input type="text" placeholder="Blog Title" className={`py-2 rounded-md px-3 border outline-none w-full ${theme === 'dark' && 'bg-gray-700 border-gray-500'}`} required name='blogTitle' onChange={inputChangeHandle} />

                        <select defaultValue={'Select category'} className={` outline-none py-2 rounded-md px-5 border ${theme === 'dark' && 'bg-gray-700 border border-gray-500'}`} required name='blogCategory' onChange={inputChangeHandle}>
                            <option >Select Category</option>
                            <option>Java</option>
                            <option>Javascript</option>
                            <option>React Js</option>
                            <option>Git</option>
                            <option>Mongo DB</option>
                        </select>

                    </div>
                    <div className="flex items-center border-2 border-dotted py-2 px-3 border-violet-500 ">



                        <input type="file" accept='image/*' onChange={blogImgChangeHandle} />

                        {
                            imageLoader ?
                                <div className="border-4 px-3 py-1 font-bold animate-pulse border-violet-500 rounded-md">
                                    <FirebaseLoader />
                                </div>
                                :
                                <button disabled={imageLoader} type='button' className={`text-xs py-2 bg-gray-700 border-violet-500 border-2 text-white rounded-md px-4 ${imageLoader ? 'cursor-not-allowed' : 'cursor-pointer'}`} onClick={firebaseUploadImg}>Upload Image</button>
                        }


                    </div>

                    <div className="w-full flex justify-center">
                        {
                            firebaseBlogImgUrl ? <img src={firebaseBlogImgUrl && firebaseBlogImgUrl} className=' rounded-md w-full bg-cover h-96 object-cover bg-center' /> : ''
                        }

                    </div>

                    <div className="my-5">
                        <ReactQuill
                            ref={quillRef}
                            className='h-72'
                            onChange={reactQuillChange}
                            modules={quillModules}
                            formats={quillFormats}
                            placeholder='Write your blog content here...'
                        />
                    </div>

                    <button type='submit' className='bg-gray-700 text-white font-semibold active:bg-gray-800 py-2 rounded-md my-5' onClick={publishBlogBtn}>Publish Blog</button>

                </form >
            </div >
            <Toaster />
        </>
    )
}
export default CreateBlog;