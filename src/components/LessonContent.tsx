import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import rehypeHighlight from 'rehype-highlight';

interface Props {
  markdown: string;
}

export default function LessonContent({ markdown }: Props) {
  return (
    <div className="prose prose-stone max-w-none prose-headings:font-semibold prose-code:bg-stone-100 prose-code:px-1 prose-code:rounded prose-pre:bg-stone-900 prose-pre:overflow-x-auto">
      <ReactMarkdown remarkPlugins={[remarkGfm]} rehypePlugins={[rehypeHighlight]}>
        {markdown}
      </ReactMarkdown>
    </div>
  );
}
