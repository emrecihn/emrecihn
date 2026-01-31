type ProductDetailProps = {
  slug: string;
};

export default function ProductDetail({ slug }: ProductDetailProps) {
  return (
    <main style={{ padding: "2rem", fontFamily: "Arial, sans-serif" }}>
      <h1>Ürün Detay</h1>
      <p>Slug: {slug}</p>
      <p>Varyant seçimi + stok + teslimat alanları (placeholder).</p>
    </main>
  );
}

ProductDetail.getInitialProps = async ({ query }: { query: { slug?: string } }) => {
  return { slug: query.slug ?? "" };
};
