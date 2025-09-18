'use client'

import { Highlight } from '@tiptap/extension-highlight'
import { Subscript } from '@tiptap/extension-subscript'
import { Superscript } from '@tiptap/extension-superscript'
import { TextAlign } from '@tiptap/extension-text-align'
import { Typography } from '@tiptap/extension-typography'
import { Selection } from '@tiptap/extensions'
import { EditorContent, EditorContext, Editor as TipTapEditor, useEditor } from '@tiptap/react'
// --- Tiptap Core Extensions ---
import { StarterKit } from '@tiptap/starter-kit'
import * as React from 'react'

// --- Styles ---
import '@/components/tiptap/editor.scss'
// --- Icons ---
import { ArrowLeftIcon } from '@/components/tiptap/tiptap-icons/arrow-left-icon'
import { HighlighterIcon } from '@/components/tiptap/tiptap-icons/highlighter-icon'
import { LinkIcon } from '@/components/tiptap/tiptap-icons/link-icon'
import '@/components/tiptap/tiptap-node/blockquote-node/blockquote-node.scss'
import '@/components/tiptap/tiptap-node/code-block-node/code-block-node.scss'
import '@/components/tiptap/tiptap-node/heading-node/heading-node.scss'
import { HorizontalRule } from '@/components/tiptap/tiptap-node/horizontal-rule-node/horizontal-rule-node-extension'
import '@/components/tiptap/tiptap-node/horizontal-rule-node/horizontal-rule-node.scss'
import '@/components/tiptap/tiptap-node/image-node/image-node.scss'
// --- Tiptap Node ---
import '@/components/tiptap/tiptap-node/list-node/list-node.scss'
import '@/components/tiptap/tiptap-node/paragraph-node/paragraph-node.scss'
// --- UI Primitives ---
import { Button } from '@/components/tiptap/tiptap-ui-primitive/button'
import { Spacer } from '@/components/tiptap/tiptap-ui-primitive/spacer'
import { Toolbar, ToolbarGroup, ToolbarSeparator } from '@/components/tiptap/tiptap-ui-primitive/toolbar'
import { BlockquoteButton } from '@/components/tiptap/tiptap-ui/blockquote-button'
import { CodeBlockButton } from '@/components/tiptap/tiptap-ui/code-block-button'
import {
    ColorHighlightPopover,
    ColorHighlightPopoverButton,
    ColorHighlightPopoverContent,
} from '@/components/tiptap/tiptap-ui/color-highlight-popover'
// --- Tiptap UI ---
import { HeadingDropdownMenu } from '@/components/tiptap/tiptap-ui/heading-dropdown-menu'
import { LinkButton, LinkContent, LinkPopover } from '@/components/tiptap/tiptap-ui/link-popover'
import { ListDropdownMenu } from '@/components/tiptap/tiptap-ui/list-dropdown-menu'
import { MarkButton } from '@/components/tiptap/tiptap-ui/mark-button'
import { TextAlignButton } from '@/components/tiptap/tiptap-ui/text-align-button'
import { UndoRedoButton } from '@/components/tiptap/tiptap-ui/undo-redo-button'
import { useCursorVisibility } from '@/hooks/use-cursor-visibility'
// --- Hooks ---
import { useIsMobile } from '@/hooks/use-mobile'
import { useWindowSize } from '@/hooks/use-window-size'

const MainToolbarContent = ({
    onHighlighterClick,
    onLinkClick,
    isMobile,
}: {
    onHighlighterClick: () => void
    onLinkClick: () => void
    isMobile: boolean
}) => {
    return (
        <>
            <Spacer />

            <ToolbarGroup>
                <UndoRedoButton action="undo" />
                <UndoRedoButton action="redo" />
            </ToolbarGroup>

            <ToolbarSeparator />

            <ToolbarGroup>
                <HeadingDropdownMenu levels={[1, 2, 3, 4]} portal={isMobile} />
                <ListDropdownMenu types={['bulletList', 'orderedList', 'taskList']} portal={isMobile} />
                <BlockquoteButton />
                <CodeBlockButton />
            </ToolbarGroup>

            <ToolbarSeparator />

            <ToolbarGroup>
                <MarkButton type="bold" />
                <MarkButton type="italic" />
                <MarkButton type="strike" />
                <MarkButton type="code" />
                <MarkButton type="underline" />
                {!isMobile ? <ColorHighlightPopover /> : <ColorHighlightPopoverButton onClick={onHighlighterClick} />}
                {!isMobile ? <LinkPopover /> : <LinkButton onClick={onLinkClick} />}
            </ToolbarGroup>

            <ToolbarSeparator />

            <ToolbarGroup>
                <MarkButton type="superscript" />
                <MarkButton type="subscript" />
            </ToolbarGroup>

            <ToolbarSeparator />

            <ToolbarGroup>
                <TextAlignButton align="left" />
                <TextAlignButton align="center" />
                <TextAlignButton align="right" />
                <TextAlignButton align="justify" />
            </ToolbarGroup>

            <Spacer />
        </>
    )
}

const MobileToolbarContent = ({ type, onBack }: { type: 'highlighter' | 'link'; onBack: () => void }) => (
    <>
        <ToolbarGroup>
            <Button data-style="ghost" onClick={onBack}>
                <ArrowLeftIcon className="tiptap-button-icon" />
                {type === 'highlighter' ? (
                    <HighlighterIcon className="tiptap-button-icon" />
                ) : (
                    <LinkIcon className="tiptap-button-icon" />
                )}
            </Button>
        </ToolbarGroup>

        <ToolbarSeparator />

        {type === 'highlighter' ? <ColorHighlightPopoverContent /> : <LinkContent />}
    </>
)

export type EditorRefType = TipTapEditor | null
export type EditorRef = React.RefObject<EditorRefType>

interface EditorProps {
    content: string
    ref?: EditorRef
    editable?: boolean
}

export function Editor({ content, ref: editorRef, editable = true }: EditorProps) {
    const isMobile = useIsMobile()
    const { height } = useWindowSize()
    const [mobileView, setMobileView] = React.useState<'main' | 'highlighter' | 'link'>('main')
    const toolbarRef = React.useRef<HTMLDivElement>(null)

    const editor = useEditor({
        immediatelyRender: false,
        shouldRerenderOnTransaction: false,
        editable,
        editorProps: {
            attributes: {
                autocomplete: 'off',
                autocorrect: 'off',
                autocapitalize: 'off',
                'aria-label': 'Main content area, start typing to enter text.',
                class: 'editor',
            },
        },
        extensions: [
            StarterKit.configure({
                horizontalRule: false,
                link: { openOnClick: false, enableClickSelection: true },
            }),
            HorizontalRule,
            TextAlign.configure({ types: ['heading', 'paragraph'] }),
            Highlight.configure({ multicolor: true }),
            Typography,
            Superscript,
            Subscript,
            Selection,
        ],
        content,
    })

    const rect = useCursorVisibility({
        editor,
        overlayHeight: toolbarRef.current?.getBoundingClientRect().height ?? 0,
    })

    React.useEffect(() => {
        if (!isMobile && mobileView !== 'main') {
            setMobileView('main')
        }
    }, [isMobile, mobileView])

    React.useEffect(() => {
        if (editorRef) {
            editorRef.current = editor
        }
    }, [editor, editorRef])

    return (
        <EditorContext.Provider value={{ editor }}>
            {editable && (
                <Toolbar
                    ref={toolbarRef}
                    style={{
                        ...(isMobile
                            ? {
                                  bottom: `calc(100% - ${height - rect.y}px)`,
                              }
                            : {}),
                    }}
                >
                    {mobileView === 'main' ? (
                        <MainToolbarContent
                            onHighlighterClick={() => setMobileView('highlighter')}
                            onLinkClick={() => setMobileView('link')}
                            isMobile={isMobile}
                        />
                    ) : (
                        <MobileToolbarContent
                            type={mobileView === 'highlighter' ? 'highlighter' : 'link'}
                            onBack={() => setMobileView('main')}
                        />
                    )}
                </Toolbar>
            )}

            <EditorContent editor={editor} role="presentation" className="editor-content" />
        </EditorContext.Provider>
    )
}
