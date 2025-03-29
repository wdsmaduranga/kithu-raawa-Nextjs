'use client';

import React, { useEffect, useRef, useState } from 'react';
import { DndProvider } from 'react-dnd';
import { HTML5Backend } from 'react-dnd-html5-backend';

import { Plate } from '@udecode/plate/react';

import { useCreateEditor } from '@/components/editor/use-create-editor';
import { SettingsDialog } from '@/components/editor/settings';
import { Editor, EditorContainer } from '@/components/plate-ui/editor';

export function PlateEditor() {
  const [value , setValue] = useState();
  const [content, setContent] = useState<any>("");
  const [_html, setHTML] = useState<any>("");
  const [isClicked, setIsClicked] = useState<boolean>(false);
  const containerRef = useRef(null);
    
  const editor = useCreateEditor();
  useEffect(() => {
    console.log("CONTENT", content);
  }, [content, _html]);


  const clickFuntion = ()=>{
    console.info('ghjh');
  }
  return (
    <DndProvider backend={HTML5Backend}>
      <Plate editor={editor} onChange={({ value }) => {
          setContent(value);
        }}>
        <EditorContainer>
          <Editor  variant="demo" />
        </EditorContainer>
        <SettingsDialog />
      </Plate>
    </DndProvider>
  );
}
