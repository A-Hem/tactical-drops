import AdminLayout from '@/components/admin/layout';
import ProductForm from '@/components/admin/product/product-form';

export default function NewProductPage() {
  return (
    <AdminLayout title="Add New Product">
      <ProductForm />
    </AdminLayout>
  );
}