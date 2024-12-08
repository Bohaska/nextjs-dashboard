import { Metadata } from 'next';
import {Suspense} from "react";
import {InvoicesTableSkeleton} from "@/app/ui/skeletons";
import CustomersTable from "@/app/ui/customers/table";

export const metadata: Metadata = {
    title: 'Customers',
};

export default async function Page(props: {
    searchParams?: Promise<{
        query?: string;
    }>;
}) {
    const searchParams = await props.searchParams;
    const query = searchParams?.query || '';

    return (
        <div className="w-full">
            <Suspense key={query} fallback={<InvoicesTableSkeleton />}>
                <CustomersTable query={query} />
            </Suspense>
        </div>
    );
}