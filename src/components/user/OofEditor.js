// SPDX-License-Identifier: AGPL-3.0-or-later
// SPDX-FileCopyrightText: 2020-2026 grommunio GmbH

import React, { useContext, useEffect } from "react";
import PropTypes from 'prop-types';
import { useRef } from 'react';
import { Editor } from '@tinymce/tinymce-react';
import { useTranslation } from 'react-i18next';
import { withStyles } from 'tss-react/mui';
import ColorModeContext from "../../ColorContext";


const styles = () => ({
  content: {
    display: 'flex',
    minHeight: '100%',
    height: 0,
    flexDirection: 'column',
    overflow: "auto",
  },
  tinyMceContainer: {
    flex: 1,
    display: 'flex',
    flexDirection: 'column',
    padding: 16,
  },
  attachments: {
    display: 'flex',
    alignItems: 'center',
  }
});


// eslint-disable-next-line react/prop-types
function OofEditor({ setRef, initialValue, disabled }) {
  const { i18n } = useTranslation();
  const editorRef = useRef(null);
  const context = useContext(ColorModeContext);
  const darkMode = context.mode === "dark";

  useEffect(() => {
    setRef(editorRef);
    return () => {
      setRef(null);
    }
  }, [editorRef]);

  return (
    <Editor
      // eslint-disable-next-line no-undef
      tinymceScriptSrc={process.env.PUBLIC_URL + '/tinymce/tinymce.min.js'}
      onInit={(evt, editor) => editorRef.current = editor}
      initialValue={initialValue || ""}
      disabled={disabled}
      init={{
        plugins: "autolink directionality image link emoticons media charmap anchor lists advlist quickbars searchreplace visualchars table",
        language: i18n.language,
        delta_height: 1,
        quickbars_insert_toolbar: false,
        link_assume_external_targets: true,
        toolbar: "undo redo | fontfamily fontsizeinput bold italic underline strikethrough | backcolor forecolor removeformat | bullist numlist outdent indent align lineheight | ltr rtl | subscript superscript | link anchor image media table | charmap emoticons | searchreplace",
        quickbars_selection_toolbar: "fontsizeinput | bold italic underline strikethrough | backcolor forecolor removeformat | quicklink blockquote quickimage quicktable",
        toolbar_mode: "sliding",
        paste_data_images: true,
        automatic_uploads: false,
        remove_trailing_brs: false,
        font_size_input_default_unit: "pt",
        browser_spellcheck: true,
        valid_elements: '*[*]',
        extended_valid_elements: 'p[class|style],span[class|style],a[href|style],*[*]',
        valid_children: '+body[p],+p[span|a|b|strong|i|em|u|#text]',
        paste_as_text: false,
        width: "100%",
        menubar: false,
        contextmenu: false,
        statusbar: false,
        skin: darkMode === "true" ? "oxide-dark" : "oxide",
        content_css: darkMode === "true" ? "dark" : "default",
        branding: false,
        relative_urls: false,
        remove_script_host: false,
        content_style: "body{ " + "word-wrap: break-word; margin: 1rem !important;" + "}",
      }}
    />
  );
}

OofEditor.propTypes = {
  initialValue: PropTypes.string,
  disabled: PropTypes.bool,
}

export default withStyles(OofEditor, styles);
