import React, { useEffect, useState } from "react";
import Modal from "../components/Modal";

function NregaInfoBox({ features, isOpen, onClose, infoType }) {

  const [ModalBody, setModalBody] = useState(<></>)

  const allowedColumns = [
    "State",
    "Panchayat",
    "Panchayat_",
    "Asset Name",
    "Work Name",
    "Work Type",
    "WorkCatego",
    "Total_Expe",
    "lat",
    "lon",
    "End Locati",
    "Unskilled_",
    "Semi-Skill",
    "Estimated",
    "Start Loca",
    "Work_start",
    "Gram_panch",
    "Unskilled",
    "Skilled",
    "Material",
    "Asset ID",
    "creation_t",
  ];

  const columnDisplayNames = {
    "State": "State",
    "Panchayat": "Panchayat",
    "Panchayat_": "Panchayat ID",
    "Asset Name": "Asset Name",
    "Work Name": "Work Name",
    "Work Type": "Work Type",
    "WorkCatego": "Work Category",
    "Total_Expe": "Total Expenditure",
    "lat": "Latitude",
    "lon": "Longitude",
    "End Locati": "End Location",
    "Unskilled_": "Unskilled Labor",
    "Semi-Skill": "Semi-Skilled Labor",
    "Estimated": "Estimated Cost",
    "Start Loca": "Start Location",
    "Work_start": "Work Start Date",
    "Gram_panch": "Gram Panchayat",
    "Unskilled": "Unskilled Labor Count",
    "Skilled": "Skilled Labor Count",
    "Material": "Material Cost",
    "Asset ID": "Asset ID",
    "creation_t": "Creation Time",
  };

  const workCategoryMapping = {
    "SWC - Landscape level impact": "Soil and water conservation",
    "Agri Impact - HH, Community": "Land restoration",
    "Plantation": "Plantations",
    "Irrigation - Site level impact": "Irrigation on farms",
    "Irrigation Site level - Non RWH": "Other farm works",
    "Household Livelihood": "Off-farm livelihood assets",
    "Others - HH, Community": "Community assets",
  };


  const assetAllowedNames = {
    "settlement": {
      "Settlement": "Settlement ID",
      "Settleme_1": "Settlement Name",
      "block_name": "Block Name",
      "number_hou": "Number of Houses",
      "CASTE_1": "Largest Caste",
      "CASTE_2": "Second Largert Caste",
      "assets": "Type of Assets",
      "Settleme_2": "Settlement Type",
      "select_one": "Demands",
      "q1": "Works Proposed",
      "select_mul": "Main Issues",
      "plan_id": "Plan Id",
      "plan_name": "Plan Name",
      "latitude": "Latitude",
      "longitude": "Longitude",
      "Livestock_": "Livestock Census",
      "farmer_fam": "Farmer Census",
      "total_hous": "Total Number of Houses",
      "select_o_1": "Community Willing to Come together",
      "households": "Total households benefited ?",
      "job_aware": "NREGA Job Awareness",

    },
    "well": {
      "plan_id": "Plan Id",
      "plan_name": "Plan Name",
      "latitude": "Latitude",
      "longitude": "Longitude",
      "select_one": "Well Owned By",
      "well_id": "Well Id",
      "households": "Number of Houselhold Benefitted",
      "beneficiar": "Beneficiary Settlement Name",
      "block_name": "Block Name",
      "select_mul": "Well used by Caste",
      "select_o_1": "Well Status",
      "select_o_2": "Maintainence Required",
    },
    "waterStructure": {
      "identified": "Waterbody is identified through",
      "wbs_type": "Type of the water structure",
      "wb_id": "Water bodies ID",
      "plan_id": "Plan Id",
      "plan_name": "Plan Name",
      "latitude": "Latitude",
      "longitude": "Longitude",
      "Benefici_1": "Beneficiary Contact Number",
      "beneficiar": "Beneficiary Settlement Name",
      "block_name": "Block Name",
      "select_mul": "Which caste group uses the water structure",
      "select_one": "Managed By?",
      "need_maint": "Maintenance Required?",
    }
  }

  // Modern table styles
  const tableStyle = {
    borderCollapse: "separate",
    borderSpacing: 0,
    width: "100%",
    borderRadius: "8px",
    overflow: "hidden",
    boxShadow: "0 4px 6px rgba(0, 0, 0, 0.1)",
    fontFamily: "-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Oxygen, Ubuntu, Cantarell, 'Open Sans', 'Helvetica Neue', sans-serif",
  };

  const headerCellStyle = {
    backgroundColor: "#f5f7fa",
    color: "#2c3e50",
    padding: "12px 16px",
    textAlign: "left",
    fontWeight: "600",
    borderBottom: "2px solid #e9ecef",
    fontSize: "14px",
  };

  const cellStyle = {
    padding: "10px 16px",
    borderBottom: "1px solid #e9ecef",
    color: "#4a5568",
    fontSize: "14px",
    transition: "background-color 0.2s",
  };

  const rowStyle = {
    transition: "background-color 0.2s",
    ":hover": {
      backgroundColor: "#f8fafc",
    }
  };

  const containerStyle = {
    display: 'flex',
    flexDirection: 'column',
    padding: '1.5em',
    marginTop: '0.8em',
    maxHeight: '100vh',
    overflowY: 'auto',
  };

  useEffect(() => {

    let tempBody = (<></>)

    if (infoType === "settlement" || infoType === "well" || infoType === "waterStructure") {

      tempBody = (
        <div style={containerStyle}>
          <table style={tableStyle}>
            <tbody>
              {features != null && Object.keys(features).map((key, idx) => {
                if (key != "geometry" && key in assetAllowedNames[infoType]) {
                  return (
                    <tr key={idx} style={rowStyle}>
                      <th style={headerCellStyle}>{assetAllowedNames[infoType][key]}</th>
                      <td style={cellStyle}>{features[key]}</td>
                    </tr>
                  )

                }
              })}
            </tbody>
          </table>
        </div>)
    }
    else if (infoType === "nrega") {
      console.log(features)
      tempBody = (
        <div style={containerStyle}>
          <table style={tableStyle}>
            <tbody>
              {features.length > 0 &&
                allowedColumns.map((column, i) => {
                  console.log(infoType)
                  const value = features[0].getProperties()[column];
                  let displayValue = value;
                  if (typeof value === "object" && value !== null) {
                    displayValue = JSON.stringify(value); // Convert object to string representation
                  }

                  if (column === "WorkCatego" && workCategoryMapping[displayValue]) {
                    displayValue = workCategoryMapping[displayValue];
                  }

                  return (
                    <tr key={i} style={rowStyle}>
                      {columnDisplayNames[column] === "Asset Name" ||
                        columnDisplayNames[column] === "Work Name" ||
                        columnDisplayNames[column] === "Panchayat" ||
                        columnDisplayNames[column] === "Gram Panchayat" ? (
                        <>
                          <th style={headerCellStyle}>{columnDisplayNames[column]}</th>
                          <td style={cellStyle}>
                            {decodeURIComponent(escape(displayValue))}
                          </td>
                        </>
                      ) : (
                        <>
                          <th style={headerCellStyle}>{columnDisplayNames[column]}</th>
                          <td style={cellStyle}>{displayValue}</td>
                        </>
                      )}
                    </tr>
                  );
                })}
            </tbody>
          </table>
        </div>
      )
    }

    setModalBody(tempBody)
  }, [infoType])

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={infoType ? "Asset Info" : "NREGA Work Information"}
      body={ModalBody}
    />
  );
}

export default NregaInfoBox;
