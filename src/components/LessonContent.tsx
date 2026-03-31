import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import rehypeHighlight from 'rehype-highlight';

interface Props {
  markdown: string;
}

export default function LessonContent({ markdown }: Props) {
  return (
    <div className="prose prose-stone max-w-none prose-headings:font-semibold prose-headings:text-stone-900 prose-p:text-stone-700 prose-p:leading-relaxed prose-li:text-stone-700 prose-strong:text-stone-900 prose-code:bg-stone-100 prose-code:px-1 prose-code:rounded prose-code:text-stone-800 prose-code:font-medium prose-pre:bg-stone-900 prose-pre:overflow-x-auto prose-pre:rounded-xl prose-blockquote:border-orange-400 prose-blockquote:text-stone-600">
      <ReactMarkdown remarkPlugins={[remarkGfm]} rehypePlugins={[rehypeHighlight]}>
        {markdown}
      </ReactMarkdown>
    </div>
  );
}
