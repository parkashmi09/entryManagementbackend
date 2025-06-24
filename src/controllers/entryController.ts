import { Response } from 'express';
import { validationResult } from 'express-validator';
import XLSX from 'xlsx';
import Entry from '../models/Entry';
import { ResponseUtils } from '../utils/response';
import { AuthenticatedRequest, QueryParams } from '../types';

export class EntryController {
  /**
   * Create a new entry
   */
  static async createEntry(req: AuthenticatedRequest, res: Response): Promise<void> {
    try {
      if (!req.user) {
        ResponseUtils.unauthorized(res, 'Authentication required');
        return;
      }

      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        ResponseUtils.validationError(res, errors.array());
        return;
      }

      const { srNo, vehicleNo, nameDetails, date, netWeight, moisture, gatePassNo, mobileNo, unload, shortage, remarks, rate } = req.body;

      const existingEntry = await Entry.findOne({ srNo, userId: req.user.id });
      if (existingEntry) {
        ResponseUtils.conflict(res, `Serial number ${srNo} already exists`);
        return;
      }

      const entry = new Entry({
        srNo, vehicleNo, nameDetails,
        date: date ? new Date(date) : new Date(),
        netWeight, moisture, gatePassNo, mobileNo, unload, shortage, remarks, rate,
        userId: req.user.id,
      });

      await entry.save();
      ResponseUtils.success(res, 'Entry created successfully', entry, 201);
    } catch (error) {
      console.error('Create entry error:', error);
      ResponseUtils.error(res, 'Failed to create entry');
    }
  }

  /**
   * Get all entries
   */
  static async getEntries(req: AuthenticatedRequest, res: Response): Promise<void> {
    try {
      if (!req.user) {
        ResponseUtils.unauthorized(res, 'Authentication required');
        return;
      }

      const { page = '1', limit = '10', search, sortBy = 'createdAt', sortOrder = 'desc', startDate, endDate } = req.query as QueryParams;

      const pageNum = parseInt(page, 10);
      const limitNum = parseInt(limit, 10);
      const skip = (pageNum - 1) * limitNum;

      let query: any = { userId: req.user.id };

      if (startDate || endDate) {
        query.date = {};
        if (startDate) query.date.$gte = new Date(startDate);
        if (endDate) query.date.$lte = new Date(endDate);
      }

      if (search) {
        query.$or = [
          { srNo: { $regex: search, $options: 'i' } },
          { vehicleNo: { $regex: search, $options: 'i' } },
          { nameDetails: { $regex: search, $options: 'i' } },
          { gatePassNo: { $regex: search, $options: 'i' } },
          { remarks: { $regex: search, $options: 'i' } },
        ];
      }

      const sort: any = {};
      sort[sortBy] = sortOrder === 'desc' ? -1 : 1;

      const [entries, total] = await Promise.all([
        Entry.find(query).sort(sort).skip(skip).limit(limitNum),
        Entry.countDocuments(query),
      ]);

      const pages = Math.ceil(total / limitNum);

      ResponseUtils.paginated(res, entries, { page: pageNum, limit: limitNum, total, pages });
    } catch (error) {
      console.error('Get entries error:', error);
      ResponseUtils.error(res, 'Failed to get entries');
    }
  }

  /**
   * Export entries to Excel
   */
  static async exportEntries(req: AuthenticatedRequest, res: Response): Promise<void> {
    try {
      if (!req.user) {
        ResponseUtils.unauthorized(res, 'Authentication required');
        return;
      }

      const { startDate, endDate } = req.query as QueryParams;
      let query: any = { userId: req.user.id };

      if (startDate || endDate) {
        query.date = {};
        if (startDate) query.date.$gte = new Date(startDate);
        if (endDate) query.date.$lte = new Date(endDate);
      }

      const entries = await Entry.find(query).sort({ date: -1, createdAt: -1 });

      if (entries.length === 0) {
        ResponseUtils.notFound(res, 'No entries found for export');
        return;
      }

      const exportData = entries.map((entry, index) => ({
        'S.No': index + 1,
        'Sr No': entry.srNo,
        'Vehicle No': entry.vehicleNo,
        'Name Details': entry.nameDetails,
        'Date': entry.date.toISOString().split('T')[0],
        'Net Weight': entry.netWeight || '',
        'Moisture': entry.moisture || '',
        'Gate Pass No': entry.gatePassNo || '',
        'Mobile No': entry.mobileNo || '',
        'Unload': entry.unload || '',
        'Shortage': entry.shortage || '',
        'Remarks': entry.remarks || '',
        'Rate': entry.rate || '',
        'Created At': entry.createdAt.toISOString(),
      }));

      const workbook = XLSX.utils.book_new();
      const worksheet = XLSX.utils.json_to_sheet(exportData);
      XLSX.utils.book_append_sheet(workbook, worksheet, 'Entries');

      const buffer = XLSX.write(workbook, { type: 'buffer', bookType: 'xlsx' });

      const filename = `entries_export_${new Date().toISOString().split('T')[0]}.xlsx`;
      res.setHeader('Content-Disposition', `attachment; filename="${filename}"`);
      res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');

      res.send(buffer);
    } catch (error) {
      console.error('Export entries error:', error);
      ResponseUtils.error(res, 'Failed to export entries');
    }
  }

  /**
   * Export ALL entries to Excel (no filters, no pagination)
   */
  static async exportAllEntries(req: AuthenticatedRequest, res: Response): Promise<void> {
    try {
      if (!req.user) {
        ResponseUtils.unauthorized(res, 'Authentication required');
        return;
      }

      // Get ALL entries for the user without any filters or pagination
      const entries = await Entry.find({ userId: req.user.id }).sort({ date: -1, createdAt: -1 });

      if (entries.length === 0) {
        ResponseUtils.notFound(res, 'No entries found for export');
        return;
      }

      const exportData = entries.map((entry, index) => ({
        'S.No': index + 1,
        'Sr No': entry.srNo,
        'Vehicle No': entry.vehicleNo,
        'Name Details': entry.nameDetails,
        'Date': entry.date.toISOString().split('T')[0],
        'Net Weight': entry.netWeight || '',
        'Moisture': entry.moisture || '',
        'Gate Pass No': entry.gatePassNo || '',
        'Mobile No': entry.mobileNo || '',
        'Unload': entry.unload || '',
        'Shortage': entry.shortage || '',
        'Remarks': entry.remarks || '',
        'Rate': entry.rate || '',
        'Created At': entry.createdAt.toISOString(),
      }));

      const workbook = XLSX.utils.book_new();
      const worksheet = XLSX.utils.json_to_sheet(exportData);
      XLSX.utils.book_append_sheet(workbook, worksheet, 'All Entries');

      const buffer = XLSX.write(workbook, { type: 'buffer', bookType: 'xlsx' });

      const filename = `all_entries_export_${new Date().toISOString().split('T')[0]}.xlsx`;
      res.setHeader('Content-Disposition', `attachment; filename="${filename}"`);
      res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');

      res.send(buffer);
    } catch (error) {
      console.error('Export all entries error:', error);
      ResponseUtils.error(res, 'Failed to export all entries');
    }
  }

  /**
   * Update an existing entry
   */
  static async updateEntry(req: AuthenticatedRequest, res: Response): Promise<void> {
    try {
      if (!req.user) {
        ResponseUtils.unauthorized(res, 'Authentication required');
        return;
      }

      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        ResponseUtils.validationError(res, errors.array());
        return;
      }

      const { id } = req.params;
      const { srNo, vehicleNo, nameDetails, date, netWeight, moisture, gatePassNo, mobileNo, unload, shortage, remarks, rate } = req.body;

      // Find the entry and verify ownership
      const entry = await Entry.findOne({ _id: id, userId: req.user.id });
      if (!entry) {
        ResponseUtils.notFound(res, 'Entry not found or unauthorized');
        return;
      }

      // Check if srNo is being changed and if it conflicts with another entry
      if (srNo !== entry.srNo) {
        const existingEntry = await Entry.findOne({ srNo, userId: req.user.id, _id: { $ne: id } });
        if (existingEntry) {
          ResponseUtils.conflict(res, `Serial number ${srNo} already exists`);
          return;
        }
      }

      // Update the entry
      const updatedEntry = await Entry.findByIdAndUpdate(
        id,
        {
          srNo, vehicleNo, nameDetails,
          date: date ? new Date(date) : entry.date,
          netWeight, moisture, gatePassNo, mobileNo, unload, shortage, remarks, rate,
          updatedAt: new Date(),
        },
        { new: true }
      );

      ResponseUtils.success(res, 'Entry updated successfully', updatedEntry);
    } catch (error) {
      console.error('Update entry error:', error);
      ResponseUtils.error(res, 'Failed to update entry');
    }
  }

  /**
   * Delete an entry
   */
  static async deleteEntry(req: AuthenticatedRequest, res: Response): Promise<void> {
    try {
      if (!req.user) {
        ResponseUtils.unauthorized(res, 'Authentication required');
        return;
      }

      const { id } = req.params;

      // Find the entry and verify ownership
      const entry = await Entry.findOne({ _id: id, userId: req.user.id });
      if (!entry) {
        ResponseUtils.notFound(res, 'Entry not found or unauthorized');
        return;
      }

      // Delete the entry
      await Entry.findByIdAndDelete(id);

      ResponseUtils.success(res, 'Entry deleted successfully', { id });
    } catch (error) {
      console.error('Delete entry error:', error);
      ResponseUtils.error(res, 'Failed to delete entry');
    }
  }

  /**
   * Get a single entry by ID
   */
  static async getEntryById(req: AuthenticatedRequest, res: Response): Promise<void> {
    try {
      if (!req.user) {
        ResponseUtils.unauthorized(res, 'Authentication required');
        return;
      }

      const { id } = req.params;

      // Find the entry and verify ownership
      const entry = await Entry.findOne({ _id: id, userId: req.user.id });
      if (!entry) {
        ResponseUtils.notFound(res, 'Entry not found or unauthorized');
        return;
      }

      ResponseUtils.success(res, 'Entry retrieved successfully', entry);
    } catch (error) {
      console.error('Get entry by ID error:', error);
      ResponseUtils.error(res, 'Failed to get entry');
    }
  }
} 