import { ImageUploader } from "@/components/image-uploader";
import { PageLayout } from "@/components/layouts/PageLayout";
import { createFileRoute } from "@tanstack/react-router";

export const Route = createFileRoute("/upload/")({
    component: RouteComponent,
});

function RouteComponent() {
    return (
        <section className='py-20'>
            <PageLayout>
                <ImageUploader />
            </PageLayout>
        </section>
    );
}
