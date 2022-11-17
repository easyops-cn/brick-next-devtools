'use strict'; // code generated by pbf v3.2.1

// Message ========================================

var Message = exports.Message = {};

Message.read = function (pbf, end) {
    return pbf.readFields(Message._readField, {source: "", payload: "", frameId: 0}, end);
};
Message._readField = function (tag, obj, pbf) {
    if (tag === 1) obj.source = pbf.readString();
    else if (tag === 2) obj.payload = pbf.readString();
    else if (tag === 3) obj.frameId = pbf.readVarint(true);
};
Message.write = function (obj, pbf) {
    if (obj.source) pbf.writeStringField(1, obj.source);
    if (obj.payload) pbf.writeStringField(2, obj.payload);
    if (obj.frameId) pbf.writeVarintField(3, obj.frameId);
};
