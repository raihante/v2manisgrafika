import Link from "next/link";
import Image from "next/image";
import { formatPrice, type Collection, type Product } from "@/lib/catalog";

export function ProductTile({ product }: { product: Product }) {
  return (
    <article className="cm-tile">
      <Link href={`/products/${product.handle}`} className="cm-tile-image">
        <Image src={product.image} alt={product.title} fill sizes="(max-width: 767px) 50vw, 25vw" className="cover-image" />
        {product.images[1] && <Image src={product.images[1]} alt="" fill sizes="(max-width: 767px) 50vw, 25vw" className="cover-image cm-tile-alt" />}
        {product.labels.length > 0 && <span className="cm-tile-label">{product.labels[0]}</span>}
      </Link>
      <Link href={`/products/${product.handle}`} className="cm-tile-title">{product.title}</Link>
      <p className="cm-tile-meta">{product.colours.length > 1 ? `${product.colours.length} Colours` : product.colours[0]?.label}</p>
      <p className="cm-tile-price">{product.soldOut ? "Sold Out" : formatPrice(product.price)}</p>
    </article>
  );
}

export default function CollectionGrid({ collection }: { collection: Collection }) {
  return (
    <section className="cm-page cm-collection">
      <nav className="cm-breadcrumb" aria-label="Breadcrumb"><Link href="/">Home</Link><span>/</span><span>{collection.title}</span></nav>
      <header className="cm-collection-head">
        <h1>{collection.title}</h1>
        <p>{collection.products.length} products</p>
      </header>
      <div className="cm-grid">{collection.products.map((product) => <ProductTile product={product} key={product.handle} />)}</div>
    </section>
  );
}
