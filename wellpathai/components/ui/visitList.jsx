"use client";

import PropTypes from "prop-types";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

const VisitList = ({ visits, onView, onDownload }) => {
  return (
    <main className="flex-1 p-8 bg-white">
      <Card className="mt-6">
        <CardContent>
          <table className="w-full text-left mt-4">
            <thead>
              <tr className="border-b">
                <th className="py-2 w-1/3">YOUR VISITS</th>
                <th className="py-2 w-1/3 text-center">QUESTIONNAIRE REPORT</th>
                <th className="py-2 w-1/3 text-center">CONSULTATION REPORT</th>
              </tr>
            </thead>
            <tbody>
              {visits.map((visit, index) => (
                <tr key={index} className="border-b">
                  <td className="py-2 w-1/3">
                    {visit.visitDate} {/* {visit.newReport && ( */}
                    <span className="ml-2 text-green-500 px-2 py-1 border border-green-500 rounded-full text-sm">
                      New Report
                    </span>
                    {/* )} */}
                  </td>
                  <td className="py-2 w-1/3 text-center">
                    {visit.questionnairesID && (
                      <div className="flex justify-center">
                        <Button
                          variant="link"
                          onClick={() => onView(visit.questionnairesID)}
                          className="text-blue-600 hover:underline"
                        >
                          View
                        </Button>
                      </div>
                    )}
                  </td>
                  <td className="py-2 w-1/3 text-center">
                    {visit.consultationID && (
                      <div className="flex justify-center">
                        <Button
                          variant="link"
                          className="text-blue-600 hover:underline"
                        >
                          Download
                        </Button>
                      </div>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </CardContent>
      </Card>
    </main>
  );
};

VisitList.propTypes = {
  visits: PropTypes.arrayOf(
    PropTypes.shape({
      visitDate: PropTypes.string.isRequired,
      newReport: PropTypes.bool,
      questionnairesID: PropTypes.string,
      consultationID: PropTypes.string,
    })
  ).isRequired,
};

export default VisitList;
