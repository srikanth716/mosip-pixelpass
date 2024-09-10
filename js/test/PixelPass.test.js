const {decode, generateQRCode, generateQRData, getMappedData, decodeMappedData} = require("../src");
const {expect} = require("expect");
const {ECC} = require("../src/types/ECC");
const JSZip = require("jszip");

const HEX_ENCODING = "hex";

test("should return decoded data for given QR data", async () => {
    const data = "NCFKVPV0QSIP600GP5L0";
    const expected = "hello";

    const actual = await decode(data);
    expect(actual).toBe(expected);
});

test("should return decoded data for given QR data for zipped data", async () => {
    const expected = "Hello World!!";
    const zip = new JSZip();
    zip.file("certificate.json", expected, {
        compression: "DEFLATE"
    });
    const data = await zip.generateAsync({type: 'string', compression: "DEFLATE"})

    const actual = await decode(data);
    expect(actual).toBe(expected);
},5000);
test("should return decoded data for given QR data in cbor", async () => {
    const data = "NCF3QBXJA5NJRCOC004 QN4";
    const expected = "{\"temp\":15}";
    const actual = await decode(data);
    expect(actual).toBe(expected);
});
test("should throw error if given data is undefined for encoding", () => {
    expect(() => generateQRData(undefined)).toThrowError(
        "byteArrayArg is null or undefined."
    );
});
test("should throw error if given data is null or undefined", async () => {
    await expect(decode(null)).rejects.toThrow("Cannot read properties of null (reading 'startsWith')");
    await expect(decode(undefined)).rejects.toThrow("Cannot read properties of undefined (reading 'startsWith')");
});
test("should throw error if given data length is bad", async () => {
    await expect(decode("1")).rejects.toThrow('utf8StringArg has incorrect length.');
    await expect(decode("1234")).rejects.toThrow("utf8StringArg has incorrect length.");
});
test("should throw error if given data is invalid", async () => {
    await expect( decode("1^")).rejects.toThrow("Invalid character at position 1.");
    await expect(decode("^1")).rejects.toThrow("Invalid character at position 0.");
    await expect(decode("0123456789^")).rejects.toThrow("Invalid character at position 10.");
});
test("should return encoded QR data for data", () => {
    const expected = "NCFKVPV0QSIP600GP5L0";
    const data = "hello";

    const actual = generateQRData(data);
    expect(actual).toBe(expected);
});

test("should return encoded QR data for given data with cbor", () => {
    const expected = "NCF3QBXJA5NJRCOC004 QN4";
    const data = '{"temp":15}';
    const actual = generateQRData(data);
    expect(actual).toBe(expected);
});
test("should return encoded QR data for data with header", () => {
    const expected = "mockHeader://" + "NCFKVPV0QSIP600GP5L0";
    const data = "hello";

    const actual = generateQRData(data, "mockHeader://");
    expect(actual).toBe(expected);
});
test("should return base64 encoded QR for given data", async () => {
    const data = "hello";
    const expected =
        "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAQ4AAAEOCAYAAAB4sfmlAAAAAklEQVR4AewaftIAAAUpSURBVO3BQY5bCw4EsCrB97+yJvvePH14YKdDsvtHAA4mAEcTgKMJwNEE4GgCcDQBOJoAHE0AjiYARxOAownA0QTgaAJwNAE4mgAcTQCOJgBHE4CjCcDRBOBoAnA0ATiaABxNAI4mAEcTgKMJwNEE4GgCcPTKh7QNP+1uPqFtntjdPNE2T+xunmgbftrdfMIE4GgCcDQBOJoAHE0AjiYARxOAownA0QTg6JUvt7v5DdrmndrmnXY3v8Hu5jdom282ATiaABxNAI4mAEcTgKMJwNEE4GgCcDQBOHrll2ibT9jdfMLu5p3a5p12N9+sbT5hd/MbTACOJgBHE4CjCcDRBOBoAnA0ATiaABxNAI5e4Vdrmyd2N+/UNk/sbvj7TACOJgBHE4CjCcDRBOBoAnA0ATiaABxNAI5e4a/UNu/UNk/sbmACcDQBOJoAHE0AjiYARxOAownA0QTgaAJw9Movsbv5l+xuPqFtntjdfLPdDf/dBOBoAnA0ATiaABxNAI4mAEcTgKMJwNEE4OiVL9c2/NQ2T+xunmibJ3Y3T7TNE7ubd2ob/v8mAEcTgKMJwNEE4GgCcDQBOJoAHE0AjiYAR90/wj+vbT5hd8PfZwJwNAE4mgAcTQCOJgBHE4CjCcDRBOBoAnD0yoe0zRO7myfa5ondzRNt88Tu5om2eWJ38812N0+0zTdrmyd2N+/UNk/sbr7ZBOBoAnA0ATiaABxNAI4mAEcTgKMJwNEE4Kj7Rz6gbd5pd/NE2zyxu/mEtnlid/NE2zyxu3mibf4lu5tPaJsndjefMAE4mgAcTQCOJgBHE4CjCcDRBOBoAnA0ATh65cvtbp5om09om09omyd2N0+0zSfsbp5om09oG36aABxNAI4mAEcTgKMJwNEE4GgCcDQBOJoAHHX/CD+0zTvtbp5omyd2N9+sbZ7Y3bxT27zT7oafJgBHE4CjCcDRBOBoAnA0ATiaABxNAI4mAEev/GPa5ondzTu1zTu1zRO7m3dqm99gd/PN2uaJ3c0nTACOJgBHE4CjCcDRBOBoAnA0ATiaABxNAI66f4S/Ttv8Brubd2qbd9rdPNE277S7+WYTgKMJwNEE4GgCcDQBOJoAHE0AjiYARxOAo+4f+YC24afdzSe0zRO7m09omyd2N+/UNk/sbp5om3fa3XzCBOBoAnA0ATiaABxNAI4mAEcTgKMJwNEE4OiVL7e7+Q3a5hPa5p3a5hN2N0+0zRO7myd2N/w0ATiaABxNAI4mAEcTgKMJwNEE4GgCcDQBOHrll2ibT9jdfELbPLG7eae24b/b3fwGE4CjCcDRBOBoAnA0ATiaABxNAI4mAEcTgKNX+Cvtbp5omyd2N++0u3mibZ5omyd2N+/UNk/sbp5omyd2N99sAnA0ATiaABxNAI4mAEcTgKMJwNEE4GgCcPQKf6W2eae2eae2eWJ380Tb/Aa7myfa5ondzSdMAI4mAEcTgKMJwNEE4GgCcDQBOJoAHE0Ajl75JXY3/5LdzSe0zRO7myfa5ondzTu1zSe0zW8wATiaABxNAI4mAEcTgKMJwNEE4GgCcDQBOHrly7UNP7XNJ+xu3ml380TbPLG7eWJ38wm7myfa5ptNAI4mAEcTgKMJwNEE4GgCcDQBOJoAHE0Ajrp/BOBgAnA0ATiaABxNAI4mAEcTgKMJwNEE4GgCcDQBOJoAHE0AjiYARxOAownA0QTgaAJwNAE4mgAcTQCOJgBHE4CjCcDRBOBoAnA0ATiaABxNAI4mAEf/A4+rCzKLi4oKAAAAAElFTkSuQmCC";

    const actual = await generateQRCode(data, ECC.M);
    expect(actual).toBe(expected);
},5000);
test("should return base64 encoded QR for given data with header", async () => {
    const data = "hello";
    const header = "mockHeader://";
    const expected =
        "data:image/png;base64,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";

    const actual = await generateQRCode(data, ECC.M, header);
    expect(actual).toBe(expected);
});
test("should return mapped CBOR data for given data with map", () => {
    const data = {"name": "Jhon", "id": "207", "l_name": "Honay"};
    const map = {"id": "1", "name": "2", "l_name": "3"};
    const expected =
        "a36131633230376132644a686f6e613365486f6e6179";

    const actual = getMappedData(data, map,true).toString(HEX_ENCODING);
    expect(actual).toBe(expected);
});

test("should return mapped data for given data with map", () => {
    const data = {"name": "Jhon", "id": "207", "l_name": "Honay"};
    const map = {"id": "1", "name": "2", "l_name": "3"};
    const expected ={"2": "Jhon", "1": "207", "3": "Honay"};

    const actual = getMappedData(data, map);
    expect(actual).toStrictEqual(expected);
});
test("should return mapped CBOR data for given data with map for claim 169 semantics", () => {

    const data = {
        "id": "11110000324013",
        "version": "1.0",
        "language": "EN",
        "fullName": "Peter M Jhon",
        "firstName": "Peter",
        "middleName": "M",
        "lastName": "Jhon",
        "dob": "19880102",
        "gender": "1",
        "address": "New City, METRO LINE, PA",
        "email": "peter@example.com",
        "phone": "+1 234-567",
        "nationality": "US",
        "maritalStatus": "2",
        "guardian": "Jhon Honai",
        "binaryImage":
            "03CBABDF83D068ACB5DE65B3CDF25E0036F2C546CB90378C587A076E7A759DFD27CA7872B6CDFF339AEAACA61A6023FD1D305A9B4F33CAA248CEDE38B67D7C915C59A51BB4E77D10077A625258873183F82D65F4C482503A5A01F41DEE612C3542E5370987815E592B8EA2020FD3BDDC747897DB10237EAD179E55B441BC6D8BAD07CE535129CF8D559445CC3A29D746FBF1174DE2E7C0F3439BE7DBEA4520CF88825AAE6B1F291A746AB8177C65B2A459DD19BD32C0C3070004B85C1D63034707CC690AB0BA023350C8337FC6894061EB8A714A8F22FE2365E7A904C72DEC9746ABEA1A3296ECACD1A40450794EDCD2B34844E7C19EB7FB1A4AF3B05C3B374BD2941603F72D3F9A62EAB9A2FDAEEEEC8EE6E350F8A1863C0A0AB1B4058D154559A1CD5133EFCF682ABC339960819C9427889D60380B635A7D21D017974BBA57798490F668ADD86DA58125D9C4C1202CA1308F7734E43E8F77CEB0AF968A8F8B88849F9B98B26620399470ED057E7931DED82876DCA896A30D0031A8CBD7B9EDFDF16C15C6853F4F8D9EEC09317C84EDAE4B349FE54D23D8EC7DC9BB9F69FD7B7B23383B64F22E25F",
        "binaryImageFormat": "2",
        "bestQualityFingers": "[1, 2]",
    };
    const map = {
        "id": "1",
        "version": "2",
        "language": "3",
        "fullName": "4",
        "firstName": "5",
        "middleName": "6",
        "lastName": "7",
        "dob": "8",
        "gender": "9",
        "address": "10",
        "email": "11",
        "phone": "12",
        "nationality": "13",
        "maritalStatus": "14",
        "guardian": "15",
        "binaryImage": "16",
        "binaryImageFormat": "17",
        "bestQualityFingers": "18",
    };

    const expected =
        "b261316e3131313130303030333234303133613263312e30613362454e61346c5065746572204d204a686f6e61356550657465726136614d6137644a686f6e61386831393838303130326139613162313078184e657720436974792c204d4554524f204c494e452c205041623131717065746572406578616d706c652e636f6d6231326a2b31203233342d35363762313362555362313461326231356a4a686f6e20486f6e61696231367903513033434241424446383344303638414342354445363542334344463235453030333646324335343643423930333738433538374130373645374137353944464432374341373837324236434446463333394145414143413631413630323346443144333035413942344633334341413234384345444533384236374437433931354335394135314242344537374431303037374136323532353838373331383346383244363546344334383235303341354130314634314445453631324333353432453533373039383738313545353932423845413230323046443342444443373437383937444231303233374541443137394535354234343142433644384241443037434535333531323943463844353539343435434333413239443734364642463131373444453245374330463334333942453744424541343532304346383838323541414536423146323931413734364142383137374336354232413435394444313942443332433043333037303030344238354331443633303334373037434336393041423042413032333335304338333337464336383934303631454238413731344138463232464532333635453741393034433732444543393734364142454131413332393645434143443141343034353037393445444344324233343834344537433139454237464231413441463342303543334233373442443239343136303346373244334639413632454142394132464441454545454338454536453335304638413138363343304130414231423430353844313534353539413143443531333345464346363832414243333339393630383139433934323738383944363033383042363335413744323144303137393734424241353737393834393046363638414444383644413538313235443943344331323032434131333038463737333445343345384637374345423041463936384138463842383838343946394239384232363632303339393437304544303537453739333144454438323837364443413839364133304430303331413843424437423945444644463136433135433638353346344638443945454330393331374338344544414534423334394645353444323344384543374443394242394636394644374237423233333833423634463232453235466231376132623138665b312c20325d";

    const actual = getMappedData(data, map,true).toString(HEX_ENCODING);
    expect(actual).toBe(expected);
});
test("should return properly mapped JSON data for given CBOR", () => {
    const expected = {"name": "Jhon", "id": "207", "l_name": "Honay"};
    const map = {"1": "id", "2": "name", "3": "l_name"};
    const data = "a302644a686f6e01633230370365486f6e6179";

    const actual = decodeMappedData(data, map);
    expect(actual).toStrictEqual(expected);
});

test("should return properly mapped JSON data for given data", () => {
    const expected = {"name": "Jhon", "id": "207", "l_name": "Honay"};
    const map = {"1": "id", "2": "name", "3": "l_name"};
    const data = {"2": "Jhon", "1": "207", "3": "Honay"};

    const actual = decodeMappedData(data, map);
    expect(actual).toStrictEqual(expected);
});
test("should return properly mapped JSON data for given CBOR for claim 169 semantics", () => {
    const expected = {
        "id": "11110000324013",
        "version": "1.0",
        "language": "EN",
        "fullName": "Peter M Jhon",
        "firstName": "Peter",
        "middleName": "M",
        "lastName": "Jhon",
        "dob": "19880102",
        "gender": "1",
        "address": "New City, METRO LINE, PA",
        "email": "peter@example.com",
        "phone": "+1 234-567",
        "nationality": "US",
        "maritalStatus": "2",
        "guardian": "Jhon Honai",
        "binaryImage":
            "03CBABDF83D068ACB5DE65B3CDF25E0036F2C546CB90378C587A076E7A759DFD27CA7872B6CDFF339AEAACA61A6023FD1D305A9B4F33CAA248CEDE38B67D7C915C59A51BB4E77D10077A625258873183F82D65F4C482503A5A01F41DEE612C3542E5370987815E592B8EA2020FD3BDDC747897DB10237EAD179E55B441BC6D8BAD07CE535129CF8D559445CC3A29D746FBF1174DE2E7C0F3439BE7DBEA4520CF88825AAE6B1F291A746AB8177C65B2A459DD19BD32C0C3070004B85C1D63034707CC690AB0BA023350C8337FC6894061EB8A714A8F22FE2365E7A904C72DEC9746ABEA1A3296ECACD1A40450794EDCD2B34844E7C19EB7FB1A4AF3B05C3B374BD2941603F72D3F9A62EAB9A2FDAEEEEC8EE6E350F8A1863C0A0AB1B4058D154559A1CD5133EFCF682ABC339960819C9427889D60380B635A7D21D017974BBA57798490F668ADD86DA58125D9C4C1202CA1308F7734E43E8F77CEB0AF968A8F8B88849F9B98B26620399470ED057E7931DED82876DCA896A30D0031A8CBD7B9EDFDF16C15C6853F4F8D9EEC09317C84EDAE4B349FE54D23D8EC7DC9BB9F69FD7B7B23383B64F22E25F",
        "binaryImageFormat": "2",
        "bestQualityFingers": "[1, 2]",
    };
    const map = {
        "1": "id",
        "2": "version",
        "3": "language",
        "4": "fullName",
        "5": "firstName",
        "6": "middleName",
        "7": "lastName",
        "8": "dob",
        "9": "gender",
        "10": "address",
        "11": "email",
        "12": "phone",
        "13": "nationality",
        "14": "maritalStatus",
        "15": "guardian",
        "16": "binaryImage",
        "17": "binaryImageFormat",
        "18": "bestQualityFingers",
    };

    const data =
        "b261316e3131313130303030333234303133613263312e30613362454e61346c5065746572204d204a686f6e61356550657465726136614d6137644a686f6e61386831393838303130326139613162313078184e657720436974792c204d4554524f204c494e452c205041623131717065746572406578616d706c652e636f6d6231326a2b31203233342d35363762313362555362313461326231356a4a686f6e20486f6e61696231367903513033434241424446383344303638414342354445363542334344463235453030333646324335343643423930333738433538374130373645374137353944464432374341373837324236434446463333394145414143413631413630323346443144333035413942344633334341413234384345444533384236374437433931354335394135314242344537374431303037374136323532353838373331383346383244363546344334383235303341354130314634314445453631324333353432453533373039383738313545353932423845413230323046443342444443373437383937444231303233374541443137394535354234343142433644384241443037434535333531323943463844353539343435434333413239443734364642463131373444453245374330463334333942453744424541343532304346383838323541414536423146323931413734364142383137374336354232413435394444313942443332433043333037303030344238354331443633303334373037434336393041423042413032333335304338333337464336383934303631454238413731344138463232464532333635453741393034433732444543393734364142454131413332393645434143443141343034353037393445444344324233343834344537433139454237464231413441463342303543334233373442443239343136303346373244334639413632454142394132464441454545454338454536453335304638413138363343304130414231423430353844313534353539413143443531333345464346363832414243333339393630383139433934323738383944363033383042363335413744323144303137393734424241353737393834393046363638414444383644413538313235443943344331323032434131333038463737333445343345384637374345423041463936384138463842383838343946394239384232363632303339393437304544303537453739333144454438323837364443413839364133304430303331413843424437423945444644463136433135433638353346344638443945454330393331374338344544414534423334394645353444323344384543374443394242394636394644374237423233333833423634463232453235466231376132623138665b312c20325d";

    const actual = decodeMappedData(data, map);
    expect(actual).toStrictEqual(expected);
});