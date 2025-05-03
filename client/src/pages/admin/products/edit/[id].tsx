import { useParams } from 'wouter';
import AdminLayout from '@/components/admin/layout';
import ProductForm from '@/components/admin/product/product-form';

export default function EditProductPage() {
  const { id } = useParams<{ id: string }>();
  const productId = parseInt(id, 10);

  return (
    <AdminLayout title="Edit Product">
      <ProductForm productId={productId} />
    </AdminLayout>
  );
}