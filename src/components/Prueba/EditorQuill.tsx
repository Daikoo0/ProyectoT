//import ReactQuill from 'react-quill';
import Quill from 'quill';
import { useEffect, useRef } from 'react';
import 'react-quill/dist/quill.snow.css';
import 'quill/dist/quill.bubble.css';  


const EditorQuill = ({ Text, SetText }) => {

    const fontSizeArr = ['8px', '9px', '10px', '12px', '14px', '16px', '20px', '24px', '32px', '42px', '54px', '68px', '84px', '98px'];
    var Size = Quill.import('attributors/style/size') as any;
    Size.whitelist = fontSizeArr
    Quill.register(Size, true);

    const toolbarOptions = [
        ['bold', 'italic', 'underline', 'strike'],        // toggled buttons
        ['blockquote', 'code-block'],
        ['link', 'image', 'video', 'formula'],

        [{ 'header': 1 }, { 'header': 2 }],               // custom button values
        [{ 'list': 'ordered' }, { 'list': 'bullet' }, { 'list': 'check' }],
        [{ 'script': 'sub' }, { 'script': 'super' }],      // superscript/subscript
        [{ 'indent': '-1' }, { 'indent': '+1' }],          // outdent/indent
        [{ 'direction': 'rtl' }],                         // text direction

        // [{ 'size': ['small', false, 'large', 'huge'] }],  // custom dropdown
        [{ 'size': fontSizeArr }],
        //[{ 'header': [1, 2, 3, 4, 5, 6, false] }],

        [{ 'color': [] }, { 'background': [] }],          // dropdown with defaults from theme
        [{ 'font': [] }],
        [{ 'align': [] }],

        ['clean']                                         // remove formatting button
    ];

    const editorRef = useRef(null);
    const limit = 2000;

    useEffect(() => {
        const quill = new Quill(editorRef.current, {
            theme: 'snow',
            placeholder: 'Escribe algo...',
            modules: {
                toolbar: {
                container : toolbarOptions,
                handlers: {
                    'image': function() {
                        const input = document.createElement('input');
                        input.setAttribute('type', 'file');
                        input.setAttribute('accept', 'image/*');
                        input.click();

                        input.onchange = function() {
                            const file = input.files[0];
                            if (file) {
                                const reader = new FileReader();
                                reader.onload = (e) => {
                                    const range = quill.getSelection();
                                    quill.insertEmbed(range.index, 'image', e.target.result);
                                };
                                reader.readAsDataURL(file);
                            }
                        };
                    }
                }}
            }
        });
        if (Text) {
            quill.root.innerHTML = Text;
        }
        // Detect changes
        quill.on('text-change', () => {

            if (quill.getLength() > limit) {

                quill.deleteText(limit - 1, quill.getLength());
                alert('¡Límite de caracteres excedido!');

            }
            let content = quill.root.innerHTML;
            SetText(content);

        });
        return () => {
            quill.off('text-change', SetText);
        };
    }, []);

    return <>
        <style>
            {`  
          .ql-picker.ql-size .ql-picker-label::before,
          .ql-picker.ql-size .ql-picker-item::before {
              content: attr(data-value) !important;
          }
            
            `}
        </style>
        <div ref={editorRef} /></>;


}

export default EditorQuill;