//import ReactQuill from 'react-quill';
import Quill from 'quill';
import { useEffect, useRef } from 'react';
import 'react-quill/dist/quill.snow.css'; 

const EditorQuill = ({ Text, SetText }) => {


    const toolbarOptions = [
        ['bold', 'italic', 'underline', 'strike'],        // toggled buttons
        ['blockquote', 'code-block'],
        ['link', 'image', 'video', 'formula'],
      
        [{ 'header': 1 }, { 'header': 2 }],               // custom button values
        [{ 'list': 'ordered'},{ 'list': 'bullet'}, { 'list': 'check' }],
        [{ 'script': 'sub'}, { 'script': 'super' }],      // superscript/subscript
        [{ 'indent': '-1'}, { 'indent': '+1' }],          // outdent/indent
        [{ 'direction': 'rtl' }],                         // text direction
      
        [{ 'size': ['small', false, 'large', 'huge'] }],  // custom dropdown
        [{ 'header': [1, 2, 3, 4, 5, 6, false] }],
      
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
           modules : {
            toolbar : toolbarOptions
           }
		});
        if (Text) {
            quill.root.innerHTML = Text;
        }
		// Detect changes
		quill.on('text-change', () => {
            
            if (quill.getLength() > limit) {
                
                quill.deleteText(limit-1, quill.getLength());
                alert('¡Límite de caracteres excedido!');    
                
            }
            let content = quill.root.innerHTML;
			SetText(content);
			
		});
		return () => {
			quill.off('text-change',SetText);
		};
	}, []);

    return <div ref={editorRef} />;


}

export default EditorQuill;