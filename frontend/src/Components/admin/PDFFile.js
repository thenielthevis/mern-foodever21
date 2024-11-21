import React from "react";
import { Page, Text, Document, StyleSheet } from "react-pdf";

const styles = StyleSheet.create({});

const PDFFile = () => {
  // return(
  //     <div>Test</div>
  // )
  <Document>
    <Page style={styles.body}>
      <Text style={styles.header}></Text>
    </Page>
  </Document>;
};

export default PDFFile;
