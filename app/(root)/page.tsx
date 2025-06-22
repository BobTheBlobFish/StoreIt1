import Image from "next/image";
import Link from "next/link";
import { Models } from "node-appwrite";

import ActionDropdown from "@/components/ActionDropdown";
import { Chart } from "@/components/Chart";
import { FormattedDateTime } from "@/components/FormattedDateTime";
import { Thumbnail } from "@/components/Thumbnail";
import { Separator } from "@/components/ui/separator";
import { getFiles, getTotalSpaceUsed } from "@/lib/actions/file.actions";
import { convertFileSize, getUsageSummary } from "@/lib/utils";

const summaryDetails = {
    Documents: {
      bgColor: "bg-[#330000]",
      icon: (
        <svg className="w-8 h-8 text-gray-200" fill="currentColor" viewBox="0 0 20 20">
          <path fillRule="evenodd" d="M4 4a2 2 0 012-2h4.586A2 2 0 0112 2.586L15.414 6A2 2 0 0116 7.414V16a2 2 0 01-2 2H6a2 2 0 01-2-2V4zm2 6a1 1 0 011-1h6a1 1 0 110 2H7a1 1 0 01-1-1zm1 3a1 1 0 100 2h6a1 1 0 100-2H7z" clipRule="evenodd" />
        </svg>
      ),
    },
    Images: {
      bgColor: "bg-[#000033]",
      icon: (
        <svg className="w-8 h-8 text-gray-200" fill="currentColor" viewBox="0 0 20 20">
          <path fillRule="evenodd" d="M4 3a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V5a2 2 0 00-2-2H4zm12 12H4l4-8 3 6 2-4 3 6z" clipRule="evenodd" />
        </svg>
      ),
    },
    Media: {
      bgColor: "bg-brand",
      icon: (
        <svg className="w-8 h-8 text-gray-200" fill="currentColor" viewBox="0 0 20 20">
          <path d="M2 6a2 2 0 012-2h6l2 2h6a2 2 0 012 2v2M2 6v10a2 2 0 002 2h12a2 2 0 002-2V8a2 2 0 00-2-2H4a2 2 0 00-2-2z" />
          <path d="M8 12l2 2 4-4" />
        </svg>
      ),
    },
    Others: {
      bgColor: "bg-[#4d4d00]",
      icon: (
        <svg className="w-8 h-8 text-gray-200" fill="currentColor" viewBox="0 0 20 20">
          <path fillRule="evenodd" d="M3 4a1 1 0 011-1h12a1 1 0 011 1v2a1 1 0 01-1 1H4a1 1 0 01-1-1V4zM3 10a1 1 0 011-1h6a1 1 0 011 1v6a1 1 0 01-1 1H4a1 1 0 01-1-1v-6zM14 9a1 1 0 00-1 1v6a1 1 0 001 1h2a1 1 0 001-1v-6a1 1 0 00-1-1h-2z" clipRule="evenodd" />
        </svg>
      ),
    },
};

const Dashboard = async () => {
  // Parallel requests
  const [files, totalSpace] = await Promise.all([
    getFiles({ types: [], limit: 10 }),
    getTotalSpaceUsed(),
  ]);

  // Get usage summary
  const usageSummary = getUsageSummary(totalSpace);

  return (
    <div className="dashboard-container">
      <section>
        <Chart used={totalSpace.used} />

        {/* Uploaded file type summaries */}
        <ul className="dashboard-summary-list">
          {usageSummary.map((summary) => {
            const details = summaryDetails[summary.title as keyof typeof summaryDetails];
            if (!details) return null;

            return (
              <Link
                href={summary.url}
                key={summary.title}
                className="dashboard-summary-card"
              >
                <div className="space-y-2">
                  <div className="flex justify-between items-center">
                    <div className={`w-12 h-12 rounded-full flex items-center justify-center flex-shrink-0 ${details.bgColor}`}>
                      {details.icon}
                    </div>
                    <h4 className="summary-type-size">
                      {convertFileSize(summary.size) || 0}
                    </h4>
                  </div>
                  <div className="flex flex-col items-center justify-center flex-1">
                    <h5 className="summary-type-title mt-2">{summary.title}</h5>
                    <Separator className="bg-light-400 my-4" />
                    <FormattedDateTime
                      date={summary.latestDate}
                      className="text-center"
                    />
                  </div>
                </div>
              </Link>
            );
          })}
        </ul>
      </section>

      {/* Recent files uploaded */}
      <section className="dashboard-recent-files">
        <h2 className="h3 xl:h2 text-light-100">Recent files uploaded</h2>
        {files.documents.length > 0 ? (
          <ul className="mt-5 flex flex-col gap-5">
            {files.documents.map((file: Models.Document) => (
              <Link
                href={file.url}
                target="_blank"
                className="flex items-center gap-3"
                key={file.$id}
              >
                <Thumbnail
                  type={file.type}
                  extension={file.extension}
                  url={file.url}
                />

                <div className="recent-file-details">
                  <div className="flex flex-col gap-1">
                    <p className="recent-file-name">{file.name}</p>
                    <FormattedDateTime
                      date={file.$createdAt}
                      className="caption"
                    />
                  </div>
                  <ActionDropdown file={file} />
                </div>
              </Link>
            ))}
          </ul>
        ) : (
          <p className="empty-list">No files uploaded</p>
        )}
      </section>
    </div>
  );
};

export default Dashboard;
