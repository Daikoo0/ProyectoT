import ReactQuill from 'react-quill';

const EditorQuill = ({ Text, SetText }) => {

    const modules = {
        toolbar: [
            [{ 'header': '1' }, { 'header': '2' }, { 'font': [] }],
            [{ size: [] }],
            ['bold', 'italic', 'underline', 'strike', 'blockquote'],
            [{ 'color': [] }, { 'background': [] }],
            [{ 'list': 'ordered' }, { 'list': 'bullet' },
            { 'indent': '-1' }, { 'indent': '+1' }],
            ['link', 'image', 'video'],
            ['clean'], [{ 'align': ["right", "center", "justify"] }]
        ],
        clipboard: {
            matchVisual: false,
        }
    };

    const formats = [
        'header', 'font', 'size',
        'bold', 'italic', 'underline', 'strike', 'blockquote',
        'list', 'bullet', 'indent',
        'link', 'image', 'video',
        'background', 'color', 'align'
    ];

    return (
        <ReactQuill
            value={Text}
            onChange={SetText}
            modules={modules}
            formats={formats}
            placeholder={"Escribe aquí..."}
        />
    );
}

export default EditorQuill;