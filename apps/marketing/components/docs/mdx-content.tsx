import { compileMDX } from 'next-mdx-remote/rsc';
import remarkGfm from 'remark-gfm';
import { mdxComponents } from '@/components/mdx';
import { cn } from '@/lib/cn';

type MdxContentProps = {
  source: string;
  className?: string;
};

export async function MdxContent({ source, className = 'docs-mdx' }: MdxContentProps) {
  const { content } = await compileMDX({
    source,
    options: {
      parseFrontmatter: true,
      mdxOptions: {
        remarkPlugins: [remarkGfm],
      },
    },
    components: mdxComponents,
  });

  return <div className={cn(className)}>{content}</div>;
}
